window.fn = {};

window.fn.openMenu = function() {
  var menu = document.getElementById('menu');
  menu.open();
};

window.fn.load = function(page, mytitle) {
  var content = document.getElementById('myNavigator');
  var menu = document.getElementById('menu');
  data = { data: { title: mytitle }, animation: 'slide' };
  content.pushPage(page, data).then(menu.close.bind(menu));
};

//-- called from window.fn.load() --
document.addEventListener('init', function(event) {
  var page = event.target;

  if (page.id === 'home.html') {
    page.querySelector('ons-toolbar .center').innerHTML = 'Han Chiang App';
  } else if (page.id === '1-news.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    loadNewsContent();
  } else if (page.id === '2-timetable.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    loadTimetableContent();
  } else if (page.id === '3-classroom.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    loadClassrmBkContent();
  } else if (page.id === '4-calendars.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    loadCalendarContent();
  } else if (page.id === '5-enrolled.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
    // loadEnrolledCoursesform();
  } else if (page.id === 'tempclassroom.html') {
    page.querySelector(
      'ons-toolbar .center'
    ).innerHTML = page.data.title.substr(19);
  } else if (page.id === 'tempcalendar.html') {
    page.querySelector(
      'ons-toolbar .center'
    ).innerHTML = page.data.title.substr(9);
  } else {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
  }

  if (page.id === 'tempnews.html') {
    var newContent = '';
    newContent +=
      newsTopImageCollection[newsItem] +
      newsTitleCollection[newsItem] +
      newsDateCollection[newsItem] +
      newsContentCollection[newsItem];
    $('#div-newscontent').html(newContent);
  }

  if (page.id === 'temptimetable.html') {
    var newContent = '';
    newContent += timeTableContents[timeTableItem].content;

    $('#div-timetablecontent').html(newContent);
    $('#div-timetablecontent img').css('width', '200%');
  }

  if (page.id === 'tempclassroom.html') {
    var newContent = '';
    newContent += classroomContents[classroomItem].content;

    $('#div-classroomcontent').html(newContent);
    $('#div-classroomcontent img').css('width', '500%');
  }

  if (page.id === 'tempcalendar.html') {
    var newContent = '';
    newContent += calendarContents[calendarItem].content;

    $('#div-calendarcontent').html(newContent);
    $('#div-calendarcontent img').css('width', '200%');
  }

  if (page.id === 'tempcoursecontent.html') {
    $('#div-coursecontent').html(courseContents);
  }

  if (page.id === 'tempregistersubjects.html') {
    $('#div-registersubject').html(regSubContents);
  }
});

//--------- NEWS ------------
function loadNewsContent() {
  var newsContent = '';
  const apiRoot = 'https://hjuapp.site/wp-json';
  //const apiRoot = 'http://www.hanchiangnews.com/en/wp-json';
  //var imgUrl;
  var allPosts = [];

  var wp = new WPAPI({ endpoint: apiRoot });
  wp.posts()
    .categories(5) // 5 = news, 6 = calendar, 8 = timetables, 9 = classroom booking
    .perPage(30)
    .order('desc')
    .orderby('date')
    .then(function(posts) {
      posts.forEach(function(post) {
        allPosts.push(post);
      });

      getThumbnail2Text(allPosts);
    });
}

var newsListPage; // cache of the news page
var newsTopImageCollection = [];
var newsTitleCollection = [];
var newsDateCollection = [];
var newsContentCollection = [];

function getThumbnail2Text(allPosts) {
  var j = 0;
  const length = allPosts.length;

  var newsContent = '';
  allPosts.forEach(function(post) {
    $.ajax({
      url: 'https://hjuapp.site/wp-json/wp/v2/media/' + post.featured_media,
      type: 'GET',
      success: function(res) {
        j++;
        newsContent += '<ons-list>';
        newsTopImageCollection[j] =
          '<img src= "' + res.media_details.sizes.medium.source_url + '">';
        newsTitleCollection[j] =
          '<ons-list-header>' + post.title.rendered + '</ons-list-header>';
        newsDateCollection[j] =
          '<h4 style="margin-left: 20px">' + extractDate(post) + '</h4>';

        newsContentCollection[j] =
          '<div class="news-content-rendered">' +
          post.content.rendered +
          '</div>';

        newsContent += '<ons-list-item tappable';
        newsContent += ' onclick="getNewsContent(';
        newsContent += j;
        newsContent += ')"';
        newsContent += '>';
        newsContent += '<div class="left">';
        newsContent += '<img src= "';
        newsContent += res.media_details.sizes.thumbnail.source_url;
        newsContent += '" class="list-item__thumbnail">';
        newsContent += '</div>';
        newsContent += '<div class="center">';
        newsContent +=
          '<span class ="list-item__title">' + post.title.rendered + '</span>';
        newsContent +=
          '<span class ="list-item__subtitle">' + extractDate(post) + '</span>';
        newsContent += '</div>';

        newsContent += '</ons-list-item>';
        newsContent += '</ons-list>';

        if (j == length) {
          $('.ui-content').html(newsContent);

          $('.progress-circular').css('display', 'none');
          newsListPage = newsContent;
        }
      }
    }); // --ajax end
  });
}

function extractDate(post) {
  var today = new Date(post.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return today;
}

var newsItem;
//-- called from embedded markup inserted in getThumbnail2Text() --
function getNewsContent(item) {
  newsItem = item;
  var content = document.getElementById('myNavigator');

  data = { data: { title: 'News' }, animation: 'slide' };
  content.pushPage('tempnews.html', data);
}

//--------- TIMETABLE ----------------
var timeTableContents = [];
var k = 0;

function loadTimetableContent() {
  var content = '';
  const apiRoot = 'https://hjuapp.site/wp-json';

  var wp = new WPAPI({ endpoint: apiRoot });

  wp.posts()
    .categories(8) // 5 = news, 6 = calendar, 8 = timetables, 9 = classroom booking
    .orderby('slug')
    .order('asc')
    .then(function(posts) {
      content += '<ons-list>';
      posts.forEach(function(post) {
        k++;
        content += '<ons-list-item modifier="chevron" tappable';
        content += ' onclick="getTimeTableContent(';
        content += k;
        content += ')">';
        content += '<ons-list-header>';
        content += post.title.rendered;
        content += '</ons-list-header>';
        content += '</ons-list-item>';
        timeTableContents[k] = {
          title: post.title.rendered,
          content: post.content.rendered
        };
      });
      content += '</ons-list>';

      $('.ui-content').html(content);
      $('.progress-circular').css('display', 'none');

      makeEmDraggable();
    });
}

var timetableItem;
function getTimeTableContent(t) {
  timeTableItem = t;

  //ons.notification.toast('you clicked: ' + j, { timeout: 1000 });
  var objData = timeTableContents[t];

  var content = document.getElementById('myNavigator');

  data = { data: { title: objData.title }, animation: 'slide' };
  content.pushPage('temptimetable.html', data);
}

//-------- CLASSROOM ---------
var classroomContents = [];
var r = 0;

function loadClassrmBkContent() {
  var content = '';
  const apiRoot = 'https://hjuapp.site/wp-json';

  var wp = new WPAPI({ endpoint: apiRoot });

  wp.posts()
    .categories(9) // 6 = calendar, 8 = timetables, 9 = classroom booking
    .orderby('slug')
    .order('asc')
    .then(function(posts) {
      content += '<ons-list>';
      posts.forEach(function(post) {
        r++;
        content += '<ons-list-item modifier="chevron" tappable';
        content += ' onclick="getClassroomContent(';
        content += r;
        content += ')">';
        content += '<ons-list-header>';
        content += post.title.rendered;
        content += '</ons-list-header>';
        content += '</ons-list-item>';
        classroomContents[r] = {
          title: post.title.rendered,
          content: post.content.rendered
        };
      });
      content += '</ons-list>';
      $('.ui-content').html(content);
      $('.progress-circular').css('display', 'none');

      makeEmDraggable();
    });
}

var classroomItem;
function getClassroomContent(p) {
  classroomItem = p;

  //ons.notification.toast('you clicked: ' + j, { timeout: 1000 });
  var objData = classroomContents[p];

  var content = document.getElementById('myNavigator');

  data = { data: { title: objData.title }, animation: 'slide' };
  content.pushPage('tempclassroom.html', data);
}

//-------- CALENDAR ---------
var calendarContents = [];
var n = 0;

function loadCalendarContent() {
  var content = '';
  const apiRoot = 'https://hjuapp.site/wp-json';

  var wp = new WPAPI({ endpoint: apiRoot });

  wp.posts()
    .categories(6) //6 = calendars
    .orderby('slug')
    .order('asc')
    .then(function(posts) {
      content += '<ons-list>';
      posts.forEach(function(post) {
        n++;
        content += '<ons-list-item modifier="chevron" tappable';
        content += ' onclick="getCalendarContent(';
        content += n;
        content += ')">';
        content += '<ons-list-header>';
        content += post.title.rendered;
        content += '</ons-list-header>';
        content += '</ons-list-item>';
        calendarContents[n] = {
          title: post.title.rendered,
          content: post.content.rendered
        };
      });
      content += '</ons-list>';
      $('.ui-content').html(content);
      $('.progress-circular').css('display', 'none');

      makeEmDraggable();
    });
}

var calendarItem;
function getCalendarContent(n) {
  calendarItem = n;

  //ons.notification.toast('you clicked: ' + j, { timeout: 1000 });
  var objData = calendarContents[n];

  var content = document.getElementById('myNavigator');

  data = { data: { title: objData.title }, animation: 'slide' };
  content.pushPage('tempcalendar.html', data);
}

//---- zoomIn image ------
function zoomIn() {
  var imagesize = $('.enlargeable img').width();
  imagesize = imagesize + 200;
  $('.enlargeable img').width(imagesize);
}

//---- zoomOut image ------
function zoomOut() {
  var imagesize = $('.enlargeable img').width();
  imagesize = imagesize - 200;
  $('.enlargeable img').width(imagesize);
}

function fitWidth() {
  //$('img').width($(document).width());
  $('.enlargeable img').width('100%');
  draggable.draggabilly('setPosition', 0, 0);
}

var draggable;
function makeEmDraggable() {
  draggable = $('.enlargeable img').draggabilly({
    // options...
  });
}

//--- default zoom -----
function zoomDefault(zoomLevel) {
  var imagesize = $('.enlargeable img').width();
  imagesize = imagesize + zoomLevel;
  $('.enlargeable img').width(imagesize);
}

//-------- CHECK ENROLLED COURSES ---------
//Todo:  create the form in enrolled.html and put a button there
// when button click will call this function:

function getEnrolledCourses() {
  $('.progress-circular').css('visibility', 'visible');
  var studentName = document.getElementById('studentname').value;

  $.ajax({
    url:
      'http://www.hanchianguniversitycollege.com/system/hcuc-api/student_course_stud_name.php?app_id=hanchiangapp2019&name=' +
      studentName,

    type: 'GET',
    success: function(res) {
      formatCourseContents(res);
    }
  }).fail(function(xhr, status, error) {
    // console.log('---error: ', error.message);
    // console.log('---status: ', status);
    // console.log('---xhr.status: ', xhr.status);

    // ons.notification.toast('Error ' + xhr.status, {
    //   timeout: 2000
    // });
    $('.progress-circular').css('visibility', 'hidden');
    ons.notification.toast('Student not found ', {
      timeout: 2000
    });
  });
}

var courseContents;
function formatCourseContents(res) {
  courseContents = '';
  console.log(res);
  var obj = JSON.parse(res);
  console.log('---res.message---:', obj.message);
  var subArray = obj.data.subject_rec.subject_details;
  courseContents += '<p>';
  courseContents += '<br><strong>Session:</strong></br>';
  courseContents += '<br>' + obj.data.subject_rec.session_name + '</br>';
  // courseContents += '<br><strong>Start Date:</strong></br>';
  courseContents += '<br>' + obj.data.subject_rec.start_date + ' to ';
  //courseContents += '<br><strong>End Date:</strong></br>';
  courseContents += obj.data.subject_rec.end_date + '</br>';
  courseContents += '<br><strong>Subject Details:</strong></br>';
  subArray.forEach(function(subj) {
    courseContents += '<br><em>' + subj.subject_code + '</em></br>';
    courseContents += '<br>' + subj.subject_name + '</br>';
  });
  courseContents += '</p>';
  showCourseContent();
}

function showCourseContent() {
  var content = document.getElementById('myNavigator');

  data = { data: { title: 'Enrolled courses' }, animation: 'slide' };
  content.pushPage('tempcoursecontent.html', data);
  $('.progress-circular').css('visibility', 'hidden');
}

function clearNameInput() {
  document.getElementById('studentname').value = '';
}

//-------6 register subjects-------
var userID;
function userLogin() {
  userID = '';
  $('.progress-circular').css('visibility', 'visible');
  var userName = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  $.ajax({
    url:
      'http://www.hanchianguniversitycollege.com/system/hcuc-api/login.php?app_id=hanchiangapp2019&username=' +
      userName +
      '&password=' +
      password,

    type: 'GET',
    success: function(res) {
      getOfferedSubjects(res);
      $('.progress-circular').css('visibility', 'hidden');
    }
  }).fail(function(xhr, status, error) {
    $('.progress-circular').css('visibility', 'hidden');
    ons.notification.toast('Error Logging in ', {
      timeout: 2000
    });
  });
}

function getOfferedSubjects(res) {
  var obj = JSON.parse(res);
  userID = obj.data.user_id;

  $.ajax({
    url:
      //simulation, obj.data.user_id is ignored, connecting to xampp
      //fake student_subject-reg.php which returns simulated json
      //for production substitute 'localhost/hanchiang' with
      //www.hanchianguniversitycollege.com/system/hcuc-api
      'http://localhost/hanchiang/student_subject_reg.php?' +
      'app_id=hanchiangapp2019&user_id=' +
      obj.data.user_id,

    type: 'GET',
    success: function(res2) {
      //var objRes = JSON.parse(res2);
      //console.log(objRes.data.student_code.student_name);
      formatOfferedSubjectContents(res2);
      $('.progress-circular').css('visibility', 'hidden');
    }
  }).fail(function(xhr, status, error) {
    $('.progress-circular').css('visibility', 'hidden');
    ons.notification.toast('Error getting Active subjects', {
      timeout: 2000
    });
  });
}

var regSubContents;
function formatOfferedSubjectContents(res) {
  var obj = JSON.parse(res);

  var subArray = obj.data.student_code.subject_details;

  regSubContents = '';

  regSubContents += '<p>';
  regSubContents += '<br>Student ID: ' + obj.data.student_code.student_id;
  regSubContents += '<br>Name: ' + obj.data.student_code.student_name;
  regSubContents += '<br>Program Name: ' + obj.data.student_code.student_name;
  regSubContents += '<br>Session: ' + obj.data.student_code.session_name;
  regSubContents += '<br>Start Date: ' + obj.data.student_code.start_date;
  regSubContents += '<br>End Date: ' + obj.data.student_code.end_date;
  regSubContents += '<p><strong>Select your subjects: </strong><p>';
  regSubContents += '<ons-list>';
  subArray.forEach(function(subj) {
    regSubContents += '<ons-list-item tappable>';
    regSubContents += ' <label class="left">';
    regSubContents += '<ons-checkbox input-id="check-1"></ons-checkbox>';
    regSubContents += '</label>';
    regSubContents += '<label for="check-1" class="center">';
    regSubContents += '<em>' + subj.subject_code + '</em>';
    regSubContents += subj.subject_name;   
    regSubContents += ' (' + subj.unit + ' units)';   
    regSubContents +=  '</label>'
    regSubContents += '</ons-list-item>';
  });
  regSubContents += '</ons-list>';
  regSubContents += '</p>';
  showOfferedSubjectsContent();
}

function showOfferedSubjectsContent() {
  var content = document.getElementById('myNavigator');

  data = { data: { title: 'Register subjects' }, animation: 'slide' };
  content.pushPage('tempregistersubjects.html', data);
  $('.progress-circular').css('visibility', 'hidden');
}

function clearLoginInput() {
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
}
