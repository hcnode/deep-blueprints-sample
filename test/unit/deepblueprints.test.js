/**
 * Created by harry on 15/10/9.
 */
var request = require('supertest');
var should = require('should');
var _ = require('lodash');

function createPath(company, team, project, todolist){
  var args = arguments;
  var path = (arguments.length < 3 ? "" : "/deep");
  var argsText = ["company", "team", "project", "todolist"];
  _.forEach(argsText, function (arg, index) {
    if(args.length > index){
      path += "/" + arg + (args[index] == "all" ? "" : ("/" + args[index]));
    }
  });
  console.log(path)
  return path;
}
describe('deepblueprints', function() {

  var companyId1,
    teamId1,
    projectId1,
    todolistId1,
    todolistId2;

  var companyId2,
    teamId2;
  describe('create action', function() {
    it('create company1', function (done) {
      request(sails.hooks.http.app)
        .post(createPath("all"))
        .send({
          name:"netease"
        })
        .end(function (err, res) {
          companyId1 = res.body.id;
          res.statusCode.should.be.exactly(201);
          done();
        });
    });
    it('create company2', function (done) {
      request(sails.hooks.http.app)
        .post(createPath("all"))
        .send({
          name:"baidu"
        })
        .end(function (err, res) {
          companyId2 = res.body.id;
          res.statusCode.should.be.exactly(201);
          done();
        });
    });
    it('create team1', function (done) {
      request(sails.hooks.http.app)
        .post(createPath(companyId1, "all"))
        .send({
          name:"web"
        })
        .end(function (err, res) {
          res.statusCode.should.be.exactly(200);
          teamId1 = _.findWhere(res.body.team, {name:"web"}).id;
          done();
        });
    });

    it('create team2', function (done) {
      request(sails.hooks.http.app)
        .post(createPath(companyId1, "all"))
        .send({
          name:"android"
        })
        .end(function (err, res) {
          res.statusCode.should.be.exactly(200);
          teamId2 = _.findWhere(res.body.team, {name:"android"}).id;
          done();
        });
    });
    it('create project1', function (done) {
      request(sails.hooks.http.app)
        .post(createPath(companyId1, teamId1, "all"))
        .send({
          name:"project1"
        })
        .end(function (err, res) {
          res.statusCode.should.be.exactly(200);
          projectId1 = _.findWhere(res.body.project, {name:"project1"}).id;
          done();
        });
    });
    it('create project2', function (done) {

      request(sails.hooks.http.app)
        .post(createPath(companyId2, teamId1, "all"))
        .send({
          name:"project2"
        })
        .end(function (err, res) {
          res.statusCode.should.be.exactly(400);
          console.log(res.body)
          done();
        });
    });

    it('create todolist1', function (done) {
      request(sails.hooks.http.app)
        .post(createPath(companyId1, teamId1, projectId1, "all"))
        .send({
          name:"todolist1"
        })
        .end(function (err, res) {
          res.statusCode.should.be.exactly(200);
          todolistId1 = _.findWhere(res.body.todolist, {name:"todolist1"}).id;
          done();
        });
    });
    it('create todolist2', function (done) {
      request(sails.hooks.http.app)
        .post(createPath(companyId1, teamId1, projectId1, "all"))
        .send({
          name:"todolist2"
        })
        .end(function (err, res) {
          res.statusCode.should.be.exactly(200);
          todolistId2 = _.findWhere(res.body.todolist, {name:"todolist2"}).id;
          done();
        });
    });
  });

  describe('popular action', function() {
    it('popular resources', function (done) {
      request(sails.hooks.http.app)
        .get(createPath(companyId1, teamId1, "all"))
        .end(function (err, res) {
          res.statusCode.should.be.exactly(200);
          res.body.should.be.instanceOf(Array);
          _.findWhere(res.body, {id:projectId1}).name.should.be.equal("project1");
          _.findWhere(res.body, {id:projectId1}).todolist
            .should.be.instanceof(Array)
            .and.have.lengthOf(2);
          done();
        });
    });
    it('popular resource', function (done) {
      request(sails.hooks.http.app)
        .get(createPath(companyId1, teamId1, projectId1))
        .end(function (err, res) {
          res.statusCode.should.be.exactly(200);
          res.body.should.be.instanceOf(Object)
            .and.have.properties({'name': "project1", 'id': projectId1});
          done();
        });
    });
    it('popular unauth resource', function (done) {
      request(sails.hooks.http.app)
        .get(createPath(companyId1, teamId2, projectId1))
        .end(function (err, res) {
          console.log(res.body);
          res.statusCode.should.be.exactly(400);
          done();
        });
    });
  });

  describe('update action', function() {
    it('update unauth resource', function (done) {
      request(sails.hooks.http.app)
        .put(createPath(companyId1, teamId2, projectId1))
        .send({
          name : "new name1"
        })
        .end(function (err, res) {
          console.log(res.body)
          res.statusCode.should.be.exactly(400);
          done();
        });
    });

    it('update resource', function (done) {
      request(sails.hooks.http.app)
        .put(createPath(companyId1, teamId1, projectId1))
        .send({
          name : "new name1"
        })
        .end(function (err, res) {
          console.log(res.body);
          res.body.name.should.be.equal("new name1");
          res.statusCode.should.be.exactly(200);
          done();
        });
    });
  });

  describe('remove action', function() {
    it('remove unauth resource', function (done) {
      request(sails.hooks.http.app)
        .get(createPath(companyId1, teamId2, projectId1, todolistId2))
        .end(function (err, res) {
          res.statusCode.should.be.exactly(400);
          done();
        });
    });
    it('remove resource', function (done) {
      request(sails.hooks.http.app)
        .get(createPath(companyId1, teamId1, projectId1, todolistId2))
        .end(function (err, res) {
          res.statusCode.should.be.exactly(200);
          done();
        });
    });
  });
});
