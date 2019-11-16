# frozen_string_literal: true

require 'rails_helper'

describe PermissionsController, type: :controller, js: true do
  before do
    create_user_with_permissions(role, :edit, table)
    @view_permission = create(:permission, subject_class: table, action: 'view')
    @create_permission = create(:permission, subject_class: table, action: 'create')
    sign_in @user
  end
  let(:role) { 'Sales' }
  let(:table) { 'users' }

  describe '#add_to_role' do
    context 'when action is view' do
      it 'adds view permission for the table to the role' do
        post :add_to_role, params: { role: role, table: table, permission: 'view' }, format: :js

        expect(@user.roles.first.permissions).to include(@view_permission)
      end
    end

    context 'when action is not view' do
      subject { post :add_to_role, params: { role: role, table: table, permission: 'create' }, format: :js }

      context 'when view is already enabled' do
        before do
          @user.roles.first.permissions << @view_permission
        end

        it 'adds action permission for the table to the role' do
          subject

          expect(@user.roles.first.permissions).to include(@create_permission)
        end
      end

      context 'when view is not already enabled' do
        before do
          @user.roles.first.permissions.delete(@view_permission)
        end

        it 'adds action and view permission for the table to the role' do
          subject

          expect(@user.roles.first.permissions).to include(@create_permission)
          expect(@user.roles.first.permissions).to include(@view_permission)
        end
      end
    end
  end

  describe '#remove_from_role' do
    context 'when action is view' do
      subject { post :remove_from_role, params: { role: role, table: table, permission: 'view' }, format: :js }

      before do
        @user.roles.first.permissions << @view_permission
      end

      it 'removes view permission for the table from the role' do
        subject

        expect(@user.roles.first.permissions).not_to include(@view_permission)
      end

      context 'when there are other actions enabled' do
        before do
          @user.roles.first.permissions << @view_permission
          @user.roles.first.permissions << @create_permission
        end

        it 'removes action and view permission for the table from the role' do
          subject

          expect(@user.roles.first.permissions).not_to include(@view_permission)
          expect(@user.roles.first.permissions).not_to include(@create_permission)
        end
      end
    end

    context 'when action is not view' do
      subject { post :remove_from_role, params: { role: role, table: table, permission: 'create' }, format: :js }

      before do
        @user.roles.first.permissions << @create_permission
      end

      it 'removes action permission for the table from the role' do
        subject

        expect(@user.roles.first.permissions).not_to include(@view_permission)
      end

      context 'when view permission is enabled' do
        before do
          @user.roles.first.permissions << @view_permission
        end

        it 'does not remove view permission for the table from the role' do
          subject

          expect(@user.roles.first.permissions).to include(@view_permission)
        end
      end
    end
  end

  describe '#enable_all' do
    subject { post :enable_all, params: { role: role, table: table }, format: :js }

    it 'enables all permissions for the table for the role' do
      subject

      expect(@user.roles.first.permissions).to include(@create_permission)
      expect(@user.roles.first.permissions).to include(@view_permission)
    end
  end

  describe '#disable_all' do
    subject { post :disable_all, params: { role: role, table: table }, format: :js }

    before do
      @user.roles.first.permissions << @view_permission
      @user.roles.first.permissions << @create_permission
    end

    it 'removes all permissions for the table from the role' do
      subject

      expect(@user.roles.first.permissions).not_to include(@view_permission)
      expect(@user.roles.first.permissions).not_to include(@create_permission)
    end
  end
end
