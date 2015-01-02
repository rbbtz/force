_ = require 'underscore'
benv = require 'benv'
Backbone = require 'backbone'
{ resolve } = require 'path'
State = require '../models/state'
Form = require '../models/form'
Step1View = benv.requireWithJadeify resolve(__dirname, '../views/step1'), [
  'template'
  'usTemplate'
  'themTemplate'
  'formTemplates.gallery'
  'formTemplates.institution'
  'formTemplates.fair'
  'formTemplates.general'
]

describe 'Step1View', ->
  before (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      Backbone.$ = $
      @state = new State
      @form = new Form
      done()

  after ->
    benv.teardown()

  beforeEach ->
    @view = new Step1View state: @state, form: @form
    @view.render()

  it 'renders the shell template', ->
    @view.$('h1').text().should.equal 'Apply to become an Artsy Partner'
    @view.$('.paf-type-select option').first().text().should.equal 'Select Organization Type'

  it 'renders the relevant form when an org type is selected', ->
    @state.set 'mode', 'gallery'
    @view.$('input[name="name"]').attr('placeholder').should.equal 'Gallery Name'
    @view.$('input[name="title"]').attr('placeholder').should.equal 'Title at Gallery'
    @view.$('input[name="website"]').length.should.equal 0
    @state.set 'mode', 'institution'
    @view.$('input[name="name"]').attr('placeholder').should.equal 'Museum / Institution Name'
    @view.$('input[name="website"]').length.should.equal 1

  it 'changes the address forms when the country is changed', (done) ->
    @state.set 'mode', 'institution'
    @view.selectCountry $.Event(currentTarget: val: 'United States')
    _.defer =>
      @view.$('input[name="zip_code"]').length.should.equal 1
      @view.$('input[name="state"]').length.should.equal 1
      @view.$('input[name="postal_code"]').length.should.equal 0
      @view.selectCountry $.Event(currentTarget: val: 'Canada')
      _.defer =>
        @view.$('input[name="zip_code"]').length.should.equal 0
        @view.$('input[name="state"]').length.should.equal 0
        @view.$('input[name="postal_code"]').length.should.equal 1
        done()
