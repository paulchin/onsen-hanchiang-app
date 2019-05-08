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

document.addEventListener('init', function(event) {
  var page = event.target;

  if (page.id === 'home.html') {
    page.querySelector('ons-toolbar .center').innerHTML = 'Han Chiang App';
  } else if (page.id === '1-news.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;

    loadNewsContent(page);
    console.log('1-news triggered...yay');
  } else if (page.id === '2-timetable.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
  } else if (page.id === '3-classroom.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
  } else if (page.id === '4-calendars.html') {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
  } else {
    page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
  }
});

function loadNewsContent(page) {
  getNews();
}

function getNews() {
  var newsContent = '';
  //const apiRoot = 'https://hjuapp.site/wp-json';
  const apiRoot = 'http://www.hanchiangnews.com/en/wp-json';
  var imgUrl;
  var allPosts = [];

  var wp = new WPAPI({ endpoint: apiRoot });
  wp.posts()
    .param('_embed')
    .perPage(6)
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

  var newsContent = '<ons-card>';
  allPosts.forEach(function(post) {
    $.ajax({
      url:
        'http://www.hanchiangnews.com/en/wp-json/wp/v2/media/' +
        post.featured_media,
      type: 'GET',
      success: function(res) {
        j++;

        newsTopImageCollection[j] =
          '<img src= "' +
          res.media_details.sizes.medium_large.source_url +
          '">';
        newsTitleCollection[j] = '<h3>' + post.title.rendered + '</h3>';
        newsDateCollection[j] = '<h4>' + extractDate(post) + '</h4>';
        newsContentCollection[j] = post.content.rendered;

        newsContent += '<li>';
        newsContent += '<a href="#" onclick="getNewsContent(';
        newsContent += j;
        newsContent += ')">';
        newsContent += '<img src= "';
        newsContent += res.media_details.sizes.thumbnail.source_url;
        newsContent += '" class="ui-li-thumb">';

        newsContent += '<p><b>' + post.title.rendered + '</b></p>';
        newsContent += '<p>' + extractDate(post) + '</p>';

        newsContent += '</a>';
        newsContent += '</li>';

        if (j == length) {
          newsContent += '</ons-card>';
          $('.ui-content').html(newsContent);

          newsListPage = newsContent;
        }
      }
    });
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

//-- called from embedded markup inserted in getThumbnail2Text() --
function getNewsContent(item) {
  $('.ui-content').html(
    newsTopImageCollection[item] +
      newsTitleCollection[item] +
      newsDateCollection[item] +
      newsContentCollection[item]
  );
}