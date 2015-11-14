/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Aaron Lu 2015 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////

function login(){
  var url = '/login';
  $.ajax({
    type: "POST",
    url: url,
    data: {
      login_name: $('#login_name')[0].value,
      password: $('#password')[0].value
    },
    success: function( data ) {
      window.BIM360 = data;
      if(data && data.auth_token){
        $("#signin_form").html('');
        $("#login_info").html(
          '<h2>Log in successfully!</h2><p>auth_token='+data.auth_token+'</p>'
          + "<a href=\"javascript:getProjects();\">Get projects</a>"
          );
      } else {
        $("#login_info").html('<h2>Log in failed: </h2><p class="error">'+data+'</p>');
      }
    }
  });
}

function getProjects(){
  var url = '/projects?auth_token=' + window.BIM360.auth_token;
  $.ajax({
    type: "GET",
    url: url,
    success: function( data ) {
      if(data && data.project_list){
        var project_list_html =
          '<h2>Project List</h2>' +
          '<table border="1">' +
          '<tr>'+
          '<th>actions</th>' +
          '<th>project_id</th>' +
          '<th>project_name</th>' +
          '<th>created_date</th>' +
          '<th>modify_date</th>' +
          '</tr>';
        for (var ii = 0; ii < data.project_list.length; ii++) {
          var project = data.project_list[ii];
          var project_html =
            '<tr>'+
            '<td><a href="javascript:getModels('+"'"+project.project_id+"'"+')">Get models</a></td>'+
            '<td>'+project.project_id+'</td>'+
            '<td>'+project.project_name+'</td>'+
            '<td>'+project.created_date+'</td>'+
            '<td>'+project.modify_date+'</td>'+
            '</tr>';
          project_list_html += project_html;
        };
        project_list_html += "</table>";
        $("#project_list").html(project_list_html);
      } else {
        $("#project_list").html('<h2>ERROR: </h2><p class="error">'+data+'</p>');
      }
    }
  });
}

function getModels(project_id) {
  var url = '/project?pid=' + project_id +
    '&auth_token=' + window.BIM360.auth_token;
  $.ajax({
    url: url,
    data: null,
    success: function( data ) {
      $("#model_list").html('');
      $('#action_list').html('');
      $('#model_viewer_code').html('');
      $('#model_viewer').html('');
      if(data && data.model_list){
        var model_list_html =
          '<h2>Model List</h2>' +
          '<table border="1">' +
          '<tr>'+
          '<th>actions</th>'+
          '<th>model_id</th>'+
          '<th>model_name</th>'+
          '<th>created_by</th>'+
          '<th>created_date</th>'+
          '<th>model_location</th>'+
          '</tr>';
          for (var ii = 0; ii < data.model_list.length; ii++) {
            var model = data.model_list[ii]
                var model_html =
                  '<tr>'+
                  "<td><a href=\"javascript:getActions('"+model.model_id+"','"+model.project_id+"')\">Get actions</a></td>"+
                  "<td>"+model.model_id+"</td>"+
                  '<td>'+model.model_name+'</td>'+
                  '<td>'+model.created_by_first_name + ' '+ model.created_by_last_name+'</td>'+
                  '<td>'+model.created_date+'</td>'+
                  '<td>'+model.model_location+'</td>'+
                  '</tr>';
                model_list_html += model_html;
              }
          model_list_html = model_list_html + '</table>';
          $("#model_list").html(model_list_html);
        } else {
          $("#model_list").html('<h2>ERROR: </h2><p class="error">'+data+'</p>');
        }
    }
  });
}

function getActions (model_id, project_id) {
  var url = '/model?mid=' + model_id +
    '&pid=' + project_id +
    '&auth_token=' + window.BIM360.auth_token
    ;
  $.ajax({
    url: url,
    success: function( data ) {
      $('#action_list').html('');
      $('#model_viewer_code').html('');
      $('#model_viewer').html('');
      var mvinfo = '';
      var markupset = [];
      if(data.view_tree){
        var vtree = data.view_tree[1];
        for (var kk = 0; kk < data.view_tree.length; kk++) {
          var vtree = data.view_tree[kk];
          if(vtree.markups){
            for (var ii = 0; ii < vtree.markups.length; ii++) {
              var markup = vtree.markups[ii];
              mvinfo += "<p><span>"+markup.name+"</span>|<span>"+markup.action_id+"</span>";
              markupset.push(markup);
            }
          }
        };
      }
      var actions_html = '<h2>Action List</h2>' +
        "<p>Actions of model "+data.model_name+":</p><a href=\"javascript:getModelViewer('"+data.action_id+"')\">"+
        "Default View</a>" + " | action_id = " + data.action_id;
      for (var jj = 0; jj < markupset.length; jj++) {
        var markup = markupset[jj];
        actions_html += "<br/>" + "<a href=\"javascript:getModelViewer('"+markup.action_id+"')\">"+"Markup "+
          markup.name+" "+jj+"</a>"+ " | action_id = " + markup.action_id;
      };
      $('#action_list').html(actions_html);
    }
  });
}

function getModelViewer(action_id) {
  var url = '/modelviewer?'+
    '&action_id=' + action_id +
    '&auth_token=' + window.BIM360.auth_token
    ;
  $.ajax({
    url: url,
    success: function( data ) {
      $('#model_viewer_code').html('');
      $('#model_viewer').html('');
      var html = '<iframe title="BIM 360 Glue Display Component" '+
      'width="800" height="600" '+
      'src="'+data.src+'" '+
      'frameborder="0" '+
      'allowfullscreen></iframe>';
      $("#model_viewer").html(html);
      $("#model_viewer_code").html("<p>embed code:</p><p>"+escapeHtml(html) + "</p>");
    }
  });
}

var escapingMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return escapingMap[s];
  });
}