# frozen_string_literal: true

class TaskQueuesController < ApplicationController
  include TaskQueueRender
  include TaskQueueRecordActivity
  include TableActivity
  include DatabasePresenterActions

  layout 'task_queue'
  before_action :set_database, only: %i[new create]
  before_action :set_activities, only: :edit

  def index
    @databases = Database.all
    @task_queues = TaskQueue.all
    render layout: 'standard'
  end

  def new
    database_connection
    @task_queue = TaskQueue.new
    @available_tables = available_tables
    @work_lists = WorkList.order(created_at: :desc)
  end

  def edit
    @task_queue = TaskQueue.find(params[:id])
    @database = Database.find(@task_queue.database_id)
    @database_connection = database_connection
    @target_db = target_db
    result = @target_db.all(@task_queue.table, 10, 0)
    @task_queue_sql = task_queue_to_sql
    @task_queue_headers = result.columns
    @table_fields = list_table_fields_with_type(@task_queue.table)
  end

  def create
    @task_queue = TaskQueue.new(task_queue_params)

    if @task_queue.save
      redirect_to edit_task_queue_path(@task_queue)
    else
      render 'create/error', status: 422, json: @task_queue.errors.full_messages
    end
  end

  def update
    @task_queue = TaskQueue.find(params[:id])
    update_task_queue
    @task_queue.save!
    @database = Database.find(@task_queue.database_id)
    @database_connection = database_connection
    data = data_for_preview(@task_queue)
    data.merge!(task_queue: @task_queue)
    render action: 'update/success', json: data
  rescue StandardError
    render action: 'update/error', status: 422, json: {}
  end

  def preview
    @task_queue = TaskQueue.find(params[:id])
    @database = Database.find(@task_queue.database_id)
    @database_connection = database_connection
    render_preview_js_task_queue
  end

  # TODO: this is duplicate of preview
  def show
    @task_queue = TaskQueue.find(params[:id])
    @database = Database.find(@task_queue.database_id)
    @database_connection = database_connection
    @target_db = target_db
    respond_to do |format|
      format.html do
        sql_result = @target_db.all(@task_queue.table, 10)
        @headers = sql_result ? sql_result.columns : []
        render layout: 'standard'
      end

      format.js do
        render_show_js_task_queue
      end
    end
  end

  def outcome
    task_queue = TaskQueue.find(outcome_params['task_queue_id'])
    outcome_success = outcome_params['outcome'] == 'success'

    item_timeout = outcome_success ? task_queue.success_outcome_timeout : task_queue.failure_outcome_timeout
    item_title = outcome_success ? task_queue.success_outcome_title : task_queue.failure_outcome_title

    outcome = create_outcome(outcome_params, item_timeout)

    @database = Database.find(task_queue.database_id)
    @database_connection = database_connection
    @target_db = target_db
    complete_outcome_actions(task_queue, outcome_params)

    ActiveRecord::Base.connection_pool.disconnect! if ActiveRecord::Base.connection_pool
    ActiveRecord::Base.establish_connection(ActiveRecord::Base.configurations.configs_for(env_name: Rails.env).first)

    render json: { outcome: outcome, user_id: current_admin_user.id, outcome_content: item_title }
  end

  def record
    @task_queue = TaskQueue.find(params[:id])
    @repo = Kuwinda::Repository::TargetDB.new(@task_queue.table)
    @row = params['task_queue_item_primary_key'].to_i
    set_activities_for_task_queue_record
    data = build_data_for_record
    render json: { row: data, activities: @activities_for_task_queue_record, author: current_admin_user.full_name }
  end

  def field_settings
    task_queue = TaskQueue.find(params[:id])
    render json: { fields: helpers.task_queue_draggable_field_settings_container(task_queue).values }
  end

  private

  def task_queue_params
    params.require(:task_queue).permit(:name,
                                       :details,
                                       :table,
                                       :database_id)
  end

  def task_queue_update_params
    params.require(:task_queue).permit(:name,
                                       :details,
                                       :query_builder_rules,
                                       :query_builder_sql,
                                       :raw_sql,
                                       :success_outcome_title,
                                       :success_outcome_timeout,
                                       :success_database,
                                       :failure_outcome_title,
                                       :failure_outcome_timeout,
                                       :failure_database,
                                       :enabled)
  end

  def outcome_params
    params.permit(:outcome, :task_queue_id, :table, :primary_key)
  end

  def handle_success(action:, js_func:, notice:)
    flash[:notice] = notice
    render(action: action, js: js_func)
  end

  def time_to_reappear?(row)
    outcome = TaskQueueOutcome.where(task_queue_id: @task_queue.id, task_queue_item_primary_key: row['id']).first

    return true unless outcome

    if outcome.task_queue_item_reapper_at && outcome.task_queue_item_reappear_at < Time.now
      outcome.delete
      true
    else
      false
    end
  end

  def field_visible?(task_queue, field)
    return task_queue.draggable_fields unless task_queue.draggable_fields.present?

    task_queue.draggable_fields.values.map { |f| f['title'] }.include?(field)
  end

  def build_data_for_record
    repo = Kuwinda::Repository::TargetDB.new
    repo.table = @task_queue.table
    row = repo.find(params['task_queue_item_primary_key'])
    record = {}
    row.each do |k, v|
      next unless field_visible?(@task_queue, k)

      record[k] = v
    end

    record
  end

  def set_database
    @database = Database.find(params[:database_id] || task_queue_params[:database_id])
  end
end
