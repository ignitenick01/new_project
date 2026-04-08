// ==UserScript==
// @name         Life Time Class Sniper
// @namespace    https://codex.local/
// @version      0.3.0
// @description  Watch one class booking flow, wait for opening time, and finish reservation without page reloads.
// @match        https://my.lifetime.life/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var STORAGE_KEY = 'life-time-class-sniper-v2';
  var PANEL_ID = 'lt-class-sniper-panel';
  var STATUS_ID = 'lt-class-sniper-status';
  var INFO_ID = 'lt-class-sniper-info';
  var DEFAULTS = {
    armed: false,
    participantName: 'shannon',
    targetUrl: '',
    customOpenAt: ''
  };

  var state = {
    settings: loadSettings(),
    lastActionAt: 0,
    lastClickedSignature: '',
    observer: null,
    editingPanel: false,
    lastStatusText: '',
    lastInfoText: ''
  };

  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULTS);
      return merge(clone(DEFAULTS), JSON.parse(raw));
    } catch (error) {
      return clone(DEFAULTS);
    }
  }

  function saveSettings(partial) {
    state.settings = merge(merge({}, state.settings), partial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
    syncPanel();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function merge(target, source) {
    Object.keys(source || {}).forEach(function (key) {
      target[key] = source[key];
    });
    return target;
  }

  function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function lower(value) {
    return cleanText(value).toLowerCase();
  }

  function isClassDetailsPage() {
    return window.location.href.indexOf('/classes/class-details.html') !== -1;
  }

  function isSeatSelectionPage() {
    var text = lower(document.body ? document.body.innerText : '');
    return text.indexOf('has been assigned spot') !== -1 ||
      text.indexOf('select a different spot below') !== -1 ||
      (text.indexOf('spot ') !== -1 && text.indexOf('finish') !== -1);
  }

  function ensurePanel() {
    if (!document.body) return null;
    var existing = document.getElementById(PANEL_ID);
    if (existing) return existing;

    var panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.innerHTML = [
      '<div style="font-size:16px;font-weight:700;margin-bottom:10px;">Class Sniper</div>',
      '<label style="display:block;margin-bottom:8px;font-size:12px;color:#cbd5e1;">',
      '<span style="display:block;margin-bottom:4px;">Participant / 抢课人</span>',
      '<input id="lt-sniper-name" type="text" style="width:100%;padding:8px 10px;border-radius:10px;border:1px solid rgba(148,163,184,.25);background:#0f172a;color:#fff;" />',
      '</label>',
      '<label style="display:block;margin-bottom:8px;font-size:12px;color:#cbd5e1;">',
      '<span style="display:block;margin-bottom:4px;">Custom open time (optional) / 自定义开抢时间（可选）</span>',
      '<input id="lt-sniper-open" type="datetime-local" style="width:100%;padding:8px 10px;border-radius:10px;border:1px solid rgba(148,163,184,.25);background:#0f172a;color:#fff;" />',
      '</label>',
      '<div style="margin-bottom:8px;font-size:12px;color:#94a3b8;">No page refresh / 不再整页刷新</div>',
      '<label style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:12px;color:#e2e8f0;"><input id="lt-sniper-armed" type="checkbox" /> Enable on this class page / 在当前课详情页启用</label>',
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">',
      '<button id="lt-sniper-save" type="button" style="padding:8px 10px;border-radius:10px;border:1px solid rgba(148,163,184,.25);background:#1d4ed8;color:#fff;font-weight:700;cursor:pointer;">Save / 保存</button>',
      '<button id="lt-sniper-now" type="button" style="padding:8px 10px;border-radius:10px;border:1px solid rgba(148,163,184,.25);background:#0f172a;color:#fff;font-weight:700;cursor:pointer;">Run now / 立刻执行</button>',
      '</div>',
      '<div id="' + STATUS_ID + '" style="font-size:12px;font-weight:700;line-height:1.45;color:#fde68a;margin-bottom:8px;">Loading...</div>',
      '<div id="' + INFO_ID + '" style="font-size:12px;line-height:1.45;color:#cbd5e1;white-space:pre-wrap;"></div>'
    ].join('');

    panel.style.position = 'fixed';
    panel.style.top = '120px';
    panel.style.right = '220px';
    panel.style.zIndex = '2147483647';
    panel.style.width = '340px';
    panel.style.padding = '14px';
    panel.style.borderRadius = '16px';
    panel.style.background = 'rgba(15, 23, 42, 0.97)';
    panel.style.color = '#ffffff';
    panel.style.boxShadow = '0 12px 28px rgba(0, 0, 0, 0.35)';
    panel.style.fontFamily = 'Arial, sans-serif';

    document.body.appendChild(panel);

    document.getElementById('lt-sniper-save').addEventListener('click', function () {
      saveFromPanel();
    });
    document.getElementById('lt-sniper-now').addEventListener('click', function () {
      saveFromPanel();
      runAutomation(true);
    });

    ['lt-sniper-name', 'lt-sniper-open'].forEach(function (id) {
      var node = document.getElementById(id);
      if (!node) return;
      node.addEventListener('focus', function () {
        state.editingPanel = true;
      });
      node.addEventListener('blur', function () {
        state.editingPanel = false;
      });
      node.addEventListener('input', function () {
        state.editingPanel = true;
      });
    });

    var armedNode = document.getElementById('lt-sniper-armed');
    if (armedNode) {
      armedNode.addEventListener('mousedown', function () {
        state.editingPanel = true;
      });
      armedNode.addEventListener('change', function () {
        saveFromPanel();
      });
    }

    return panel;
  }

  function syncPanel() {
    if (!ensurePanel()) return;
    if (state.editingPanel) return;

    var nameInput = document.getElementById('lt-sniper-name');
    var openInput = document.getElementById('lt-sniper-open');
    var armedInput = document.getElementById('lt-sniper-armed');

    if (nameInput) nameInput.value = state.settings.participantName || '';
    if (openInput) openInput.value = normalizeDateTimeLocalValue(state.settings.customOpenAt || '');
    if (armedInput) armedInput.checked = !!state.settings.armed && state.settings.targetUrl === window.location.href;
  }

  function saveFromPanel() {
    var participantName = cleanText(document.getElementById('lt-sniper-name').value || 'shannon') || 'shannon';
    var customOpenAt = normalizeDateTimeLocalValue(document.getElementById('lt-sniper-open').value || '');
    var armed = !!document.getElementById('lt-sniper-armed').checked;

    saveSettings({
      participantName: participantName,
      customOpenAt: customOpenAt,
      armed: armed,
      targetUrl: armed ? window.location.href : state.settings.targetUrl
    });

    state.editingPanel = false;
    setStatus(
      armed
        ? 'Auto-booking enabled for this class page. / 已在当前课详情页启用自动抢课。'
        : 'Saved, but auto-booking is off. / 已保存，但自动抢课未启用。'
    );
  }

  function setStatus(text) {
    ensurePanel();
    var node = document.getElementById(STATUS_ID);
    if (!node) return;
    if (state.lastStatusText === text) return;
    state.lastStatusText = text;
    node.textContent = text;
  }

  function setInfo(text) {
    ensurePanel();
    var node = document.getElementById(INFO_ID);
    if (!node) return;
    if (state.lastInfoText === text) return;
    state.lastInfoText = text;
    node.textContent = text;
  }

  function getPageTitle() {
    var h1 = document.querySelector('h1');
    return cleanText(h1 && h1.textContent) || 'Class details';
  }

  function getOpenBannerText() {
    var bodyText = cleanText(document.body ? (document.body.innerText || document.body.textContent) : '');
    var match = bodyText.match(/Registration\s+will\s+be\s+open\s+on\s+.*?(?:AM|PM)/i);
    return match ? cleanText(match[0]) : '';
  }

  function normalizeOpenBannerDateText(text) {
    return cleanText(text)
      .replace(/^Registration will be open on\s+/i, '')
      .replace(/(\d{1,2})(st|nd|rd|th)\b/gi, '$1')
      .replace(/\s+at\s+/i, ' ')
      .replace(/\s+/g, ' ');
  }

  function parseOpenTime() {
    if (state.settings.customOpenAt) {
      var manual = new Date(state.settings.customOpenAt);
      if (!isNaN(manual.getTime())) return manual;
    }

    var banner = getOpenBannerText();
    if (!banner) return null;
    var parsed = new Date(normalizeOpenBannerDateText(banner));
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  function formatDate(date) {
    if (!date) return 'unknown';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function formatDuration(totalSeconds) {
    var seconds = Math.max(0, Number(totalSeconds) || 0);
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainSeconds = seconds % 60;

    function pad(value) {
      return String(value).padStart(2, '0');
    }

    return pad(hours) + ':' + pad(minutes) + ':' + pad(remainSeconds);
  }

  function getSummaryText() {
    var parts = [];
    parts.push('Class / 课程: ' + getPageTitle());
    parts.push('Enabled on this page / 当前页已启用: ' + (state.settings.armed && state.settings.targetUrl === window.location.href ? 'yes' : 'no'));
    parts.push('Participant / 抢课人: ' + (state.settings.participantName || 'shannon'));
    parts.push('Open time / 开抢时间: ' + formatDate(parseOpenTime()));
    parts.push('URL matches target / 当前页匹配目标: ' + (state.settings.targetUrl === window.location.href ? 'yes' : 'no'));
    return parts.join('\n');
  }

  function normalizeDateTimeLocalValue(value) {
    var text = cleanText(value);
    if (!text) return '';
    var parsed = new Date(text);
    if (isNaN(parsed.getTime())) return text;

    function pad(num) {
      return String(num).padStart(2, '0');
    }

    return parsed.getFullYear() +
      '-' + pad(parsed.getMonth() + 1) +
      '-' + pad(parsed.getDate()) +
      'T' + pad(parsed.getHours()) +
      ':' + pad(parsed.getMinutes());
  }

  function isLikelyChecked(input) {
    if (!input) return false;
    if (input.checked) return true;
    if (input.getAttribute('aria-checked') === 'true') return true;
    return false;
  }

  function clickNode(node) {
    if (!node) return false;
    node.scrollIntoView({ block: 'center' });
    node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    node.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    node.click();
    return true;
  }

  function getParticipantLabels() {
    return Array.prototype.slice.call(document.querySelectorAll('label')).filter(function (label) {
      var text = lower(label.innerText || label.textContent);
      return text.indexOf('junhui') !== -1 || text.indexOf('shannon') !== -1;
    });
  }

  function findParticipantControlByName(name) {
    var wanted = lower(name);
    var labels = getParticipantLabels();

    for (var i = 0; i < labels.length; i += 1) {
      var label = labels[i];
      var text = lower(label.innerText || label.textContent);
      if (text.indexOf(wanted) === -1) continue;

      var input = label.querySelector('input[type="checkbox"], input[type="radio"]');
      if (input) {
        return { target: input, clickable: label };
      }

      var parent = label.parentElement;
      if (parent) {
        var siblingInput = parent.querySelector('input[type="checkbox"], input[type="radio"]');
        if (siblingInput) {
          return { target: siblingInput, clickable: label };
        }
      }
    }

    return null;
  }

  function unselectParticipantIfNeeded(name) {
    var control = findParticipantControlByName(name);
    if (!control) {
      return 'Participant "' + name + '" not found. / 没找到此人。';
    }

    if (!isLikelyChecked(control.target)) {
      return 'Participant "' + name + '" already unselected. / 本来就没勾选。';
    }

    clickNode(control.clickable || control.target);
    return 'Unselected participant "' + name + '". / 已取消勾选。';
  }

  function selectParticipantIfNeeded() {
    var control = findParticipantControlByName(state.settings.participantName);
    if (!control) {
      return 'Participant "' + state.settings.participantName + '" not found yet. / 还没找到这个人。';
    }

    if (isLikelyChecked(control.target)) {
      return 'Participant "' + state.settings.participantName + '" already selected. / 已勾选。';
    }

    clickNode(control.clickable || control.target);
    return 'Selected participant "' + state.settings.participantName + '". / 已勾选此人。';
  }

  function prepareParticipants() {
    return [
      unselectParticipantIfNeeded('junhui'),
      selectParticipantIfNeeded()
    ].join(' ');
  }

  function getActionButtons() {
    var wantedWords = ['reserve', 'book', 'register', 'continue', 'confirm', 'complete', 'submit'];
    var blockedWords = ['cancel', 'close', 'log out', 'add to calendar', 'help'];
    var nodes = Array.prototype.slice.call(document.querySelectorAll('button, a[role="button"], input[type="button"], input[type="submit"]'));

    return nodes.filter(function (node) {
      var text = lower(node.innerText || node.value || node.getAttribute('aria-label'));
      if (!text) return false;
      if (blockedWords.some(function (word) { return text.indexOf(word) !== -1; })) return false;
      return wantedWords.some(function (word) { return text.indexOf(word) !== -1; });
    });
  }

  function clickBestActionButton() {
    var buttons = getActionButtons();
    if (!buttons.length) {
      return 'No booking button available yet. / 预约按钮还没出现。';
    }

    var button = buttons[0];
    var signature = lower(button.innerText || button.value || button.getAttribute('aria-label')) + '|' + window.location.href;
    if (state.lastClickedSignature === signature && Date.now() - state.lastActionAt < 1500) {
      return 'Waiting for page response after click. / 点击后等待页面响应。';
    }

    state.lastClickedSignature = signature;
    state.lastActionAt = Date.now();
    clickNode(button);
    return 'Clicked action button / 已点击按钮: ' + cleanText(button.innerText || button.value || button.getAttribute('aria-label'));
  }

  function clickFinishIfPresent() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll('button, a[role="button"], input[type="button"], input[type="submit"]'));
    for (var i = 0; i < nodes.length; i += 1) {
      var text = lower(nodes[i].innerText || nodes[i].value || nodes[i].getAttribute('aria-label'));
      if (text.indexOf('finish') === -1) continue;

      var signature = 'finish|' + window.location.href;
      if (state.lastClickedSignature === signature && Date.now() - state.lastActionAt < 1500) {
        return 'Waiting for finish response. / 等待 Finish 响应。';
      }

      state.lastClickedSignature = signature;
      state.lastActionAt = Date.now();
      clickNode(nodes[i]);
      return 'Clicked Finish. / 已点击 Finish。';
    }

    return 'Finish button not found yet. / 还没找到 Finish。';
  }

  function pageLooksBooked() {
    var bodyText = lower(document.body ? document.body.innerText : '');
    return bodyText.indexOf('you are registered') !== -1 ||
      bodyText.indexOf('reservation confirmed') !== -1 ||
      bodyText.indexOf('you\'re booked') !== -1 ||
      bodyText.indexOf('successfully booked') !== -1;
  }

  function runAutomation(force) {
    if (isSeatSelectionPage()) {
      ensurePanel();
      setInfo(getSummaryText() + '\nFlow / 流程: seat selection');
      setStatus(clickFinishIfPresent());
      return;
    }

    if (!isClassDetailsPage()) {
      setStatus('Open the exact class-details page first. / 请先打开具体课程详情页。');
      setInfo('This script only runs on a single class detail page. / 这个脚本只在单节课详情页工作。');
      return;
    }

    ensurePanel();
    setInfo(getSummaryText());

    if (pageLooksBooked()) {
      setStatus('Booking appears complete. / 看起来已经抢课成功。');
      return;
    }

    var activeForThisPage = state.settings.armed && state.settings.targetUrl === window.location.href;
    if (!activeForThisPage && !force) {
      setStatus('Saved, but auto-booking is not enabled here. / 已保存，但当前页未启用自动抢课。');
      return;
    }

    var openAt = parseOpenTime();
    var now = new Date();

    if (openAt && now.getTime() < openAt.getTime() && !force) {
      var seconds = Math.ceil((openAt.getTime() - now.getTime()) / 1000);
      setStatus('Waiting for opening time / 等待开抢: ' + formatDuration(seconds));
      return;
    }

    if (!openAt && !force) {
      setStatus('Open time not detected yet. / 还没有识别到开抢时间。');
      return;
    }

    var participantMessage = prepareParticipants();
    var buttonMessage = clickBestActionButton();
    setStatus(participantMessage + ' ' + buttonMessage);
  }

  function startObserver() {
    if (state.observer || !document.body) return;
    state.observer = new MutationObserver(function () {
      if (!document.getElementById(PANEL_ID)) {
        ensurePanel();
        syncPanel();
      }
    });
    state.observer.observe(document.body, { childList: true, subtree: true });
  }

  function start() {
    ensurePanel();
    syncPanel();
    startObserver();
    runAutomation(false);
    window.setInterval(function () {
      runAutomation(false);
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
