# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  before_action :load_view_builders, :load_target_db_tables

  private

  def load_view_builders
    @view_builders = ViewBuilder.where(status: 'active')
  end

  def load_target_db_tables
    @target_db_tables ||= ClientRecord.connection.tables
  end
end
