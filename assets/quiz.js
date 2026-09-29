/* ==========================================================================
   quiz.js — 可复用的交互组件（无依赖，纯原生 JS）
   组件：
     1. .quiz            多选题：点选即时判定 + 反馈文字（反馈回路越紧越好）
     2. .recall          回忆卡：先自己想，再点开对照（retrieval practice）
     3. ol.steps.checkable  可勾选的动手步骤
   另外会自动更新页面上 .lesson-progress 的答题进度。
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------------- 进度条 ---------------- */

  function refreshProgress() {
    var el = document.querySelector('.lesson-progress');
    if (!el) return;
    var all = $('.quiz');
    if (!all.length) return;
    var answered = 0, right = 0;
    all.forEach(function (q) {
      if (q.querySelector('.quiz-opt.wrong')) { answered++; return; }
      var ok = q.querySelector('.quiz-opt.correct');
      if (ok && ok.disabled) { answered++; right++; }
    });
    el.textContent = '已作答 ' + answered + ' / ' + all.length + ' 题　·　答对 ' + right + ' 题';
  }

  /* ---------------- 1. 多选题 ---------------- */

  function initQuiz(root) {
    var opts = $('.quiz-opt', root);
    if (!opts.length) return;
    var feedback = root.querySelector('.quiz-feedback');
    var answered = false;

    // 打乱选项顺序，避免"正确答案总在第一个"变成位置线索
    var holder = opts[0].parentNode;
    var shuffled = opts.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
    }
    shuffled.forEach(function (el) { holder.appendChild(el); });

    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (answered) return;
        answered = true;

        var isRight = btn.getAttribute('data-correct') === 'true';

        opts.forEach(function (b) {
          b.disabled = true;
          if (b.getAttribute('data-correct') === 'true') {
            b.classList.add('correct');
            b.insertAdjacentHTML('beforeend', '<span class="mark">✓</span>');
          }
        });
        if (!isRight) {
          btn.classList.add('wrong');
          btn.insertAdjacentHTML('beforeend', '<span class="mark">✗</span>');
        }

        if (feedback) {
          feedback.textContent = isRight
            ? (feedback.getAttribute('data-right') || '对。')
            : (feedback.getAttribute('data-wrong') || '不对，再看一眼上面的说明。');
          feedback.className = 'quiz-feedback show ' + (isRight ? 'ok' : 'no');
        }
        refreshProgress();
      });
    });
  }

  /* ---------------- 2. 回忆卡 ---------------- */

  function initRecall(root) {
    var btn = root.querySelector('.recall-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = root.classList.toggle('revealed');
      btn.textContent = open ? '收起' : (btn.getAttribute('data-label') || '看答案');
    });
  }

  /* ---------------- 3. 可勾选步骤 ---------------- */

  function initSteps(list) {
    $('li', list).forEach(function (li) {
      li.addEventListener('click', function (e) {
        if (e.target.closest('a, code, button, pre')) return;
        li.classList.toggle('done');
      });
    });
  }

  /* ---------------- 启动 ---------------- */

  function boot() {
    // 先补默认值，再绑定事件
    $('.quiz-opt').forEach(function (b) {
      if (!b.hasAttribute('data-correct')) b.setAttribute('data-correct', 'false');
    });
    $('.quiz').forEach(initQuiz);
    $('.recall').forEach(initRecall);
    $('ol.steps.checkable').forEach(initSteps);
    refreshProgress();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
