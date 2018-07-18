# frozen_string_literal: true

emails = ['test@example.com',
          'test2@example.com',
          'test3@example.com',
          'test4@example.com']

emails.each do |email|
  User.create!(email: email,
               password: '123456789',
               password_confirmation: '123456789')
end
