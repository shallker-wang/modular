fs = require('fs')
Modular = require('../lib/modular').__proto__
log = require('../util/debug').log('Test Modular', 2)

testRoot = './test'
Modular.set 'root', testRoot

# describe 'Modular.wrapModule()', ->
#   it 'should wrap module', ->
#     path = './foo.js'
#     code = 'var foo;'
#     wrap = "\n"
#     wrap += "define('" + path + "'"
#     wrap += ', function(exports, require, module) {' + "\n" + code + '});'
#     wrap += "\n"
#     log Modular.wrapModule(path, code).should.eql(wrap);

describe 'Modular.watch()', ->
  watchListener = (eventName, filePath)->
  Modular.watch (eventName, filePath)->
    watchListener(eventName, filePath)

  it 'should trigger callback when a new .js file is created', (done)->
    watchListener = (eventName, filePath)-> done()

    fs.writeFileSync "#{testRoot}/test.js", 'var test;'

  it 'should trigger callback when a .js file is deleted', (done)->
    watchListener = (eventName, filePath)-> done()

    fs.unlinkSync "#{testRoot}/test.js"

  it 'should trigger callback when a new .coffee file is created', (done)->
    watchListener = (eventName, filePath)-> done()

    fs.writeFileSync "#{testRoot}/test.coffee", 'var test;'

  it 'should trigger callback when a .coffee file is deleted', (done)->
    watchListener = (eventName, filePath)-> done()
    fs.unlinkSync "#{testRoot}/test.coffee"

  it 'should not trigger callback when a none module file is created', (done)->
    watchListener = -> throw 'failed'
    fs.writeFileSync "#{testRoot}/test.txt", 'test'
    setTimeout done, 500

  it 'should not trigger callback when a none module file is deleted', (done)->
    watchListener = -> throw 'failed'
    fs.unlinkSync "#{testRoot}/test.txt", 'test'
    setTimeout done, 500

  it 'should not trigger callback when a build file is changed', (done)->
    watchListener = -> throw 'failed'
    testBuildFile = 'test-build.js'
    Modular.set 'file', testBuildFile
    fs.writeFileSync "#{testRoot}/#{testBuildFile}"
    fs.unlinkSync "#{testRoot}/#{testBuildFile}"
    setTimeout done, 500
