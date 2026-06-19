(function() {
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function card(movie) {
    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <div class="movie-cover">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="card-badge">' + escapeHtml(movie.category) + '</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h2>' + escapeHtml(movie.title) + '</h2>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="movie-card-meta">',
      '      <span>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.year) + '</span>',
      '      <strong>' + escapeHtml(movie.score) + '</strong>',
      '    </div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function search(value) {
    var keyword = String(value || '').trim().toLowerCase();

    if (!keyword) {
      results.innerHTML = '';
      return;
    }

    var matched = window.SEARCH_INDEX.filter(function(movie) {
      return [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine,
        movie.category
      ].join(' ').toLowerCase().indexOf(keyword) !== -1;
    }).slice(0, 160);

    if (!matched.length) {
      results.innerHTML = '<div class="empty-filter-result is-visible">没有找到匹配的影片</div>';
      return;
    }

    results.innerHTML = matched.map(card).join('');
  }

  if (input) {
    input.value = query;
    input.addEventListener('input', function() {
      search(input.value);
    });
  }

  if (results) {
    search(query);
  }
}());
