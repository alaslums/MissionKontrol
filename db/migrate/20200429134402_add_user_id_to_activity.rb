class AddUserIdToActivity < ActiveRecord::Migration[5.1]
  def change
    add_column :activities, :user_id, :integer
  end
end
