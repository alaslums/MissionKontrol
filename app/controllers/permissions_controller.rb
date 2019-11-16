# frozen_string_literal: true

class PermissionsController < ApplicationController
  include UserAbilities

  layout 'dashboard'

  before_action :load_available_tables,
                :load_task_queues,
                :check_target_db_connection
  before_action :check_user_admin_abilities

  def index
    @headers = ['Table'] + roles.map(&:name)
    @tables = available_tables.to_a
    @roles = roles

    respond_to do |format|
      format.html do
        render_show_html
      end

      format.js do
        render_show_js
      end
    end
  end

  def add_to_role
    @role = Role.find_by(name: permission_params[:role])

    @permission = Permission.find_by(subject_class: permission_params[:table],
                                     action: permission_params[:permission])

    if permission_params[:permission] != 'view'
      view_permission = Permission.find_by(subject_class: permission_params[:table], action: 'view')
      @role.permissions << view_permission unless @role.permissions.include? view_permission
    end

    @role.permissions << @permission unless @role.permissions.include? @permission
  end

  def remove_from_role
    @role = Role.find_by(name: permission_params[:role])

    if permission_params[:permission] == 'view'
      existing_permissions = @role.permissions.where(subject_class: permission_params[:table])

      existing_permissions.each { |permission| @role.permissions.delete(permission) }
    else
      @permission = Permission.find_by(subject_class: permission_params[:table],
                                       action: permission_params[:permission])

      @role.permissions.delete(@permission) if @role.permissions.include? @permission
    end
  end

  def enable_all
    @role = Role.find_by(name: permission_params[:role])
    permissions = Permission.where(subject_class: permission_params[:table])

    permissions.each { |permission| @role.permissions << permission unless @role.permissions.include? permission }
  end

  def disable_all
    @role = Role.find_by(name: permission_params[:role])
    existing_permissions = @role.permissions.where(subject_class: permission_params[:table])

    existing_permissions.each { |permission| @role.permissions.delete(permission) }
  end

  private

  def permission_params
    params.permit(:permission, :role, :table)
  end

  def render_show_html
    render :index
  end

  def render_show_js
    columns = []

    result_columns = ['Table'] + roles.map(&:name)

    result_columns.each do |c|
      columns << { data: c }
    end

    render json: {
      data: table_permission_data,
      columns: columns,
      draw: params['draw'].to_i,
      recordsTotal: Permission.all.count,
      recordsFiltered: Permission.all.count
    }
  end

  def roles
    Role.all.sort
  end

  def available_tables
    Kuwinda::Presenter::ListAvailableTables.new(ClientRecord).call
  end

  def table_permission_data
    permissions = Permission.all
    grouped_permissions = permissions.group_by(&:subject_class)
    data = []
    grouped_permissions.each do |table|
      table_data = { 'Table' => table.first.to_s.humanize }
      @roles.each do |role|
        table_data.merge!(role.name.to_s => role_permissions_level(table.last, role))
        table.last.each do |permission|
          data_key = role.name + '_' + permission.action
          data_value = role_has_permission?(permission, role)
          table_data.merge!(data_key => data_value)
        end
      end
      data << table_data
    end
    data
  end

  def role_permissions_level(table, role)
    permissions = (table & role.permissions)

    if permissions.empty?
      "<img src='/assets/images/icons/circle-with-cross.png' class='tooltipster-tooltip' data-tooltip-content='#tooltip_content' data-role='" + role.name + "' data-table='" + table.first.subject_class + "'>"
    elsif permissions.length == table.length
      "<img src='/assets/images/icons/circle-with-check-symbol.png' class='tooltipster-tooltip' data-tooltip-content='#tooltip_content' data-role='" + role.name + "' data-table='" + table.first.subject_class + "'>"
    else
      "<img src='/assets/images/icons/circle-with-contrast.png' class='tooltipster-tooltip' data-tooltip-content='#tooltip_content' data-role='" + role.name + "' data-table='" + table.first.subject_class + "'>"
    end
  end

  def role_has_permission?(permission, role)
    role.permissions.include? permission
  end
end
