/* ==========================================================================
   workbench.js — 学习工作台的行为
   1. 所有 label.wb-check 里的复选框自动存 localStorage（关掉浏览器也不丢）
   2. 顶部总进度条 = 所有 wb-check 的完成比例
   3. 坑清单支持实时过滤
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'cpp-workbench-v1';
  var $ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------------- 状态读写 ---------------- */

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();

  /* ---------------- 进度条 ---------------- */

  function refreshMeter() {
    var boxes = $('input.wb-cb');
    var fill = document.querySelector('.wb-meter-fill');
    var label = document.querySelector('.wb-meter-label');
    if (!boxes.length) return;

    var done = boxes.filter(function (b) { return b.checked; }).length;
    var pct = Math.round((done / boxes.length) * 100);

    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = '学习台进度 ' + done + ' / ' + boxes.length + '　（' + pct + '%）';

    // 每张卡片右上角的 x/y
    $('.card').forEach(function (card) {
      var cb = $('input.wb-cb', card);
      var out = card.querySelector('h3 .count');
      if (!cb.length || !out) return;
      var d = cb.filter(function (b) { return b.checked; }).length;
      out.textContent = d + ' / ' + cb.length;
    });
  }

  /* ---------------- 复选框 ---------------- */

  function initChecks() {
    $('input.wb-cb').forEach(function (box) {
      var id = box.getAttribute('data-id');
      if (!id) return;
      if (state[id]) box.checked = true;

      box.addEventListener('change', function () {
        if (box.checked) state[id] = 1; else delete state[id];
        save(state);
        refreshMeter();
      });
    });
    refreshMeter();
  }

  /* ---------------- 坑清单过滤 ---------------- */

  function initFilter() {
    var input = document.querySelector('.wb-filter');
    if (!input) return;
    // 关键：表格在 .card 里，不在标题元素里 —— 用 closest 往上找
    var scope = input.closest('.card') || document;
    var items = $('tbody tr', scope);

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (tr) {
        var hit = !q || tr.textContent.toLowerCase().indexOf(q) >= 0;
        tr.classList.toggle('wb-hidden', !hit);
        if (hit) shown++;
      });
      var empty = scope.querySelector('.wb-noresult');
      if (empty) empty.classList.toggle('wb-hidden', shown !== 0);
    });
  }

  /* ---------------- 全部重置 ---------------- */

  function initReset() {
    var btn = document.querySelector('.wb-reset');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (!window.confirm('清空所有勾选（作业状态 + 掌握情况 + 课程进度）？')) return;
      state = {};
      save(state);
      $('input.wb-cb').forEach(function (b) { b.checked = false; });
      refreshMeter();
    });
  }

  /* ---------------- 启动 ---------------- */

  function boot() {
    initChecks();
    initFilter();
    initReset();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
