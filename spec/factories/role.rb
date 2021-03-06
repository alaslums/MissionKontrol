# frozen_string_literal: true

FactoryBot.define do
  factory :role do
    name { 'Admin' }
    administrator { false }
    editor { false }
    export { false }

    trait :admin do
      name { 'Admin' }
      administrator { true }
      editor { true }
      export { true }
    end

    trait :Editor do
      name { 'Editor' }
    end

    trait :editor do
      name { 'Editor' }
      editor { true }
    end

    trait :user do
      name { 'User' }
    end

    trait :export do
      export { true }
    end
  end
end
