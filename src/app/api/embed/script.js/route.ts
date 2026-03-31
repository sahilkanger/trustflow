import { NextResponse } from "next/server";

/**
 * Serves the TrustFlow embed script.
 * Website owners add: <script src="https://trustflow.app/api/embed/script.js" data-space-id="xxx"></script>
 * This is THE viral distribution engine — every embed is a billboard for TrustFlow.
 */
export async function GET() {
  const script = `
(function() {
  'use strict';

  var TRUSTFLOW_API = (document.currentScript && document.currentScript.getAttribute('data-api')) || '${process.env.NEXT_PUBLIC_APP_URL || ""}';
  var spaceId = document.currentScript && document.currentScript.getAttribute('data-space-id');
  var theme = (document.currentScript && document.currentScript.getAttribute('data-theme')) || 'light';
  var layout = (document.currentScript && document.currentScript.getAttribute('data-layout')) || 'wall';
  var maxItems = parseInt((document.currentScript && document.currentScript.getAttribute('data-max')) || '12', 10);
  var containerId = (document.currentScript && document.currentScript.getAttribute('data-container')) || null;

  if (!spaceId) {
    console.error('[TrustFlow] Missing data-space-id attribute');
    return;
  }

  function createStyles() {
    var style = document.createElement('style');
    style.textContent = [
      '.tf-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
      '.tf-carousel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; gap: 16px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding-bottom: 8px; -ms-overflow-style: none; scrollbar-width: none; }',
      '.tf-carousel::-webkit-scrollbar { display: none; }',
      '.tf-card { background: ' + (theme === 'dark' ? '#1f2937' : '#ffffff') + '; border: 1px solid ' + (theme === 'dark' ? '#374151' : '#e5e7eb') + '; border-radius: 12px; padding: 20px; scroll-snap-align: start; min-width: 300px; }',
      '.tf-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }',
      '.tf-stars { display: flex; gap: 2px; margin-bottom: 12px; }',
      '.tf-star { width: 16px; height: 16px; }',
      '.tf-star-filled { color: #F59E0B; }',
      '.tf-star-empty { color: ' + (theme === 'dark' ? '#4B5563' : '#D1D5DB') + '; }',
      '.tf-text { font-size: 14px; line-height: 1.6; color: ' + (theme === 'dark' ? '#D1D5DB' : '#374151') + '; margin-bottom: 16px; }',
      '.tf-author { display: flex; align-items: center; gap: 10px; }',
      '.tf-avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px; flex-shrink: 0; }',
      '.tf-name { font-size: 14px; font-weight: 600; color: ' + (theme === 'dark' ? '#F9FAFB' : '#111827') + '; }',
      '.tf-role { font-size: 12px; color: ' + (theme === 'dark' ? '#9CA3AF' : '#6B7280') + '; }',
      '.tf-branding { text-align: center; margin-top: 16px; }',
      '.tf-branding a { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: ' + (theme === 'dark' ? '#6B7280' : '#9CA3AF') + '; text-decoration: none; transition: color 0.2s; }',
      '.tf-branding a:hover { color: ' + (theme === 'dark' ? '#9CA3AF' : '#6B7280') + '; }',
      '.tf-branding-icon { width: 16px; height: 16px; background: #4F46E5; border-radius: 3px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 9px; font-weight: 700; }',
      '.tf-loading { display: flex; justify-content: center; padding: 40px; }',
      '.tf-spinner { width: 32px; height: 32px; border: 3px solid ' + (theme === 'dark' ? '#374151' : '#E5E7EB') + '; border-top-color: #4F46E5; border-radius: 50%; animation: tf-spin 0.8s linear infinite; }',
      '@keyframes tf-spin { to { transform: rotate(360deg); } }',
      '.tf-empty { text-align: center; padding: 40px; color: ' + (theme === 'dark' ? '#6B7280' : '#9CA3AF') + '; font-size: 14px; }'
    ].join('\\n');
    document.head.appendChild(style);
  }

  function starSVG(filled) {
    return '<svg class="tf-star ' + (filled ? 'tf-star-filled' : 'tf-star-empty') + '" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>';
  }

  function renderTestimonial(t, color) {
    var stars = '';
    if (t.rating) {
      stars = '<div class="tf-stars">';
      for (var i = 1; i <= 5; i++) {
        stars += starSVG(i <= t.rating);
      }
      stars += '</div>';
    }

    var role = '';
    if (t.authorTitle || t.authorCompany) {
      role = '<div class="tf-role">' +
        (t.authorTitle || '') +
        (t.authorTitle && t.authorCompany ? ' at ' : '') +
        (t.authorCompany || '') +
        '</div>';
    }

    var initial = t.authorName ? t.authorName[0].toUpperCase() : '?';

    return '<div class="tf-card">' +
      stars +
      '<div class="tf-text">&ldquo;' + escapeHtml(t.text) + '&rdquo;</div>' +
      '<div class="tf-author">' +
        '<div class="tf-avatar" style="background-color:' + color + '">' + initial + '</div>' +
        '<div>' +
          '<div class="tf-name">' + escapeHtml(t.authorName) + '</div>' +
          role +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function render(data) {
    var container = containerId ? document.getElementById(containerId) : null;
    if (!container) {
      container = document.createElement('div');
      container.id = 'trustflow-widget-' + spaceId;
      if (document.currentScript && document.currentScript.parentNode) {
        document.currentScript.parentNode.insertBefore(container, document.currentScript);
      } else {
        document.body.appendChild(container);
      }
    }

    if (!data.testimonials || data.testimonials.length === 0) {
      container.innerHTML = '<div class="tf-empty">No testimonials yet</div>';
      return;
    }

    var items = data.testimonials.slice(0, maxItems);
    var layoutClass = layout === 'carousel' ? 'tf-carousel' : 'tf-wall';
    var color = data.space.primaryColor || '#4F46E5';

    var html = '<div class="' + layoutClass + '">';
    for (var i = 0; i < items.length; i++) {
      html += renderTestimonial(items[i], color);
    }
    html += '</div>';

    if (data.branding) {
      html += '<div class="tf-branding">' +
        '<a href="https://trustflow.app?ref=embed-js&sid=' + encodeURIComponent(spaceId) + '" target="_blank" rel="noopener">' +
        '<span class="tf-branding-icon">T</span> Powered by TrustFlow' +
        '</a></div>';
    }

    container.innerHTML = html;
  }

  // Initialize
  createStyles();

  var target = containerId ? document.getElementById(containerId) : null;
  if (target) {
    target.innerHTML = '<div class="tf-loading"><div class="tf-spinner"></div></div>';
  }

  var apiUrl = TRUSTFLOW_API + '/api/widget/' + encodeURIComponent(spaceId);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', apiUrl);
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        render(JSON.parse(xhr.responseText));
      } catch(e) {
        console.error('[TrustFlow] Parse error', e);
      }
    }
  };
  xhr.onerror = function() {
    console.error('[TrustFlow] Network error');
  };
  xhr.send();
})();
`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
