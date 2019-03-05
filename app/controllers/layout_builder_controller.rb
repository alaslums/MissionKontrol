# frozen_string_literal: true

class LayoutBuilderController < ApplicationController
  layout 'layout_builder', only: [:new, :edit]
  layout 'dashboard', only: [:index, :preview]
  skip_before_action :verify_authenticity_token
  before_action :load_available_tables,
                :authenticate_admin_user!


  def new
    @available_tables = available_tables
    @tables_with_layouts = tables_with_layouts
    @view_builder = ViewBuilder.new
  end

  def show
    @view_builder = ViewBuilder.find(params[:id])
  end

  def table_fields_with_type
    @fields_with_type = list_table_fields_with_type(params[:table])
    render json: @fields_with_type
  end

  def create
    @view_builder = ViewBuilder.new(view_name: params[:view_name],
                                    table_name: field_params[:table])

    if @view_builder.save!
      render json: @view_builder
    end
  end

  def update
    @view_builder = ViewBuilder.find(params[:id])

    update_attributes(@view_builder, params)

    if @view_builder.save!

      respond_to do |format|
        format.js { render 'layout_builder/update/success' }
      end
    end
  end

  def edit
    @view_builder = ViewBuilder.find(params[:id])
    @relatable_tables = relatable_tables(@view_builder.table_name)
  end

  def preview
    @layout_builder = ViewBuilder.find(params[:id])
    @target_db_repo = Kuwinda::Repository::TargetDB.new(@layout_builder.table_name)
    @rows = @target_db_repo.all(5)

    respond_to do |format|
      format.js { render action: 'edit/success' }
      format.html { render action: 'preview' }
    end

  rescue ActiveRecord::StatementInvalid => e
    @rows = []

    respond_to do |format|
      format.js { render action: 'edit/error' }
    end
  end

  private

  def load_view_builder
    @view_builder = ViewBuilder.find(params[:id])
  end

  def list_table_fields_with_type(table)
    Kuwinda::Presenter::ListTableFieldsWithType.new(ClientRecord, table).call
  end

  def tables_with_layouts
    tables_with_layouts = []
    available_tables.select do |table|
      tables_with_layouts << table if ViewBuilder.find_by(table_name: table).present?
    end
    tables_with_layouts
  end

  def available_tables
    Kuwinda::Presenter::ListAvailableTables.new(ClientRecord).call
  end

  def relatable_tables(table)
    Kuwinda::Presenter::ListRelatableTables.new(ClientRecord, table).call
  end

  def field_params
    params.permit(:view_name, :table, selectedOptions: [])
  end

  def update_attributes(view_builder, params)
    view_builder.status = params[:status] if params[:status]
    view_builder.view_name = params[:name] if params[:name]
    view_builder.commentable = params[:view_builder][:commentable] if params[:view_builder][:commentable]
    view_builder.show_status = params[:view_builder][:show_status] if params[:view_builder][:show_status]
    view_builder.table_name = params[:view_builder][:table_name] if params[:view_builder][:table_name]
    view_builder.parent_comment_table = params[:view_builder][:parent_comment_table] if params[:view_builder][:parent_comment_table]
    view_builder.draggable_fields_header_container1 = params[:view_builder][:draggable_fields_header_container1] if params[:view_builder][:draggable_fields_header_container1]
    view_builder.draggable_fields_header_container2 = params[:view_builder][:draggable_fields_header_container2] if params[:view_builder][:draggable_fields_header_container2]
    view_builder.draggable_fields_side_container = params[:view_builder][:draggable_fields_side_container] if params[:view_builder][:draggable_fields_side_container]
    view_builder.draggable_fields_main_container1 = params[:view_builder][:draggable_fields_main_container1] if params[:view_builder][:draggable_fields_main_container1]
    view_builder.draggable_fields_main_container2 = params[:view_builder][:draggable_fields_main_container2] if params[:view_builder][:draggable_fields_main_container2]
    view_builder.draggable_fields_main_container3 = params[:view_builder][:draggable_fields_main_container3] if params[:view_builder][:draggable_fields_main_container3]
    view_builder.hidden_columns = params[:view_builder][:hidden_columns] if params[:view_builder][:hidden_columns]
  end
end
