# frozen_string_literal: true

class TaskQueueOutcome < ApplicationRecord
  OUTCOMES = %w[
    success
    failure
  ].freeze

  belongs_to :task_queue
  validates :outcome, inclusion: { in: OUTCOMES }
  validates :outcome,
            :task_queue_id,
            :task_queue_item_table,
            :task_queue_item_primary_key, presence: true
end
