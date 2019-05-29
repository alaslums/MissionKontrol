# frozen_string_literal: true

class TaskQueue < ApplicationRecord
  validates :name, :table, presence: true

  OUTCOME_TIMEOUTS = [
    ["1 Day", '86400', ]
  ]

  def to_sql
    return '' if query_builder_sql.blank?

    "select * from #{table} where #{query_builder_sql};"
  end
end
