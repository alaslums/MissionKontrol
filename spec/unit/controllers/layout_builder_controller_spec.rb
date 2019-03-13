# frozen_string_literal: true

require 'rails_helper'

describe LayoutBuilderController, type: :controller do
  let(:table) { 'Users' }

  let(:admin) do
    AdminUser.first_or_create(email: 'test@test.com', password: '123456', password_confirmation: '123456')
  end

  describe 'GET new' do
    before do
      sign_in admin
      get :new
    end

    it 'will render the page' do
      expect(response.status).to eq(200)
    end

    xit 'will assign the available tables' do
      expect(assigns(:available_tables)).to eq available_tables
    end
  end

  describe 'POST create' do
    before { post :create, params: params }
    let(:view_name) { 'View name' }
    let(:params) do
      {
        view_name: view_name,
        table: table,
        selectedOptions: %w[id name email]
      }
    end
    let(:table_attributes) do
      {
        'visible_fields' => {
          '0' => 'id',
          '1' => 'name',
          '2' => 'email'
        }
      }
    end

    xit 'will create the view builder' do
      expect(assigns(:view_builder).view_name).to eq view_name
      expect(assigns(:view_builder).table_name).to eq table
    end

    xit 'will create the view_builders visible_fields' do
      expect(assigns(:view_builder).table_attributes).to eq table_attributes
    end

    xit 'will save the view builder' do
      expect(assigns(:view_builder)).to be_a ViewBuilder
    end

    xit 'will render the configure_table_order template' do
      expect(response).to render_template(:configure_table_order)
    end
  end

  describe 'PATCH update' do
    before do
      put :update, params: params
      view_builder.reload
    end
    let(:params) do
      {
        id: view_builder.id,
        tableConfigurations: table_configurations,
        defaultRows: default_rows
      }
    end
    let(:view_builder) { create(:view_builder) }
    let(:default_rows) { '2' }
    let(:table_configurations) do
      {
        '1' => { 'Field' => 'area', 'Position' => '1' },
        '2' => { 'Field' => 'level', 'Position' => '2' },
        '3' => { 'Field' => 'plan', 'Position' => '3' },
        '4' => { 'Field' => 'space', 'Position' => '4' }
      }
    end
    let(:expected_positions) do
      {
        '1' => 'area',
        '2' => 'level',
        '3' => 'plan',
        '4' => 'space'
      }
    end

    xit 'will update the view builder with the default rows' do
      expect(view_builder.table_attributes['default_rows']).to eq default_rows
    end

    xit 'will update the positions of the visible fields' do
      expect(view_builder.table_attributes['visible_fields']).to eq expected_positions
    end

    xit 'will redirect to view the configuration' do
      expect(response).to redirect_to(view_builder_url(view_builder))
    end
  end

  describe 'GET show' do
    context "when client database is valid" do
      before { get :show, params: params }
      let(:params) { { id: view_builder.id } }
      let(:view_builder) { create(:view_builder) }

      xit 'will render the page' do
        expect(response.status).to eq(200)
      end

      xit 'will assign the view_builder' do
        expect(assigns[:view_builder]).to eq view_builder
      end
    end

    context "when client database connection is invalid" do
      it "renders the bad connection template" do
        sign_in admin
        allow(controller).to receive(:show).and_raise(InvalidClientDatabaseError.new)
        get :show, params: { use_route: 'layouts/' }

        expect(response).to render_template("tables/bad_connection")
      end
    end
  end

  describe 'GET edit' do
    context "when client database connection is invalid" do
      it "renders the bad connection template" do
        sign_in admin
        allow(controller).to receive(:edit).and_raise(InvalidClientDatabaseError.new)
        get :edit, params: { use_route: 'layouts/' }

        expect(response).to render_template("tables/bad_connection")
      end
    end
  end

  describe 'GET preview' do
    context "when client database connection is invalid" do
      it "renders the bad connection template" do
        sign_in admin
        allow(controller).to receive(:preview).and_raise(InvalidClientDatabaseError.new)
        get :preview, params: { use_route: 'layouts/' }

        expect(response).to render_template("tables/bad_connection")
      end
    end
  end
end

def available_tables
  Kuwinda::Presenter::ListAvailableTables.new(ClientRecord).call
end