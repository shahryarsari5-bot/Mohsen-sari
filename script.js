const ADMIN_USER = "admin";
const ADMIN_PASS = "admin123";

const header = document.getElementById('mainHeader');
if (header) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });
}

function openLoginModal() { 
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'flex'; 
}

function closeLoginModal() { 
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'none'; 
}

function checkLogin() {
  const u = document.getElementById('adminUser').value;
  const p = document.getElementById('adminPass').value;
  if (u === ADMIN_USER && p === ADMIN_PASS) {
    localStorage.setItem('isAdmin', 'true');
    closeLoginModal();
    alert('مدیر گرامی، خوش آمدید!');
    location.reload();
  } else {
    alert('نام کاربری یا رمز عبور نادرست است.');
  }
}

function logoutAdmin() {
  localStorage.removeItem('isAdmin');
  location.reload();
}

function initDefaultData() {
  const announcements = localStorage.getItem('site_announcements');
  if (!announcements) {
    const defaultNotif = [{
      id: Date.now(),
      text: "وبینار تخصصی مدیریت پرورش گوساله‌ها - چهارشنبه این هفته ساعت ۱۸",
      date: new Date().toISOString()
    }];
    localStorage.setItem('site_announcements', JSON.stringify(defaultNotif));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initDefaultData();
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  
  if (isAdmin) {
    const adminBtn = document.getElementById('adminNavBtn');
    if (adminBtn) {
      adminBtn.innerText = 'خروج مدیر';
      adminBtn.onclick = logoutAdmin;
    }
    const adminPanels = document.querySelectorAll('.admin-only');
    adminPanels.forEach(p => p.style.display = 'block');
  }

  renderAnnouncements();
  renderCoursesGrouped();
});

function saveAnnouncement() {
  const text = document.getElementById('announcementText').value;
  if (!text) return alert('لطفاً متن پیام را وارد کنید');
  
  const announcements = JSON.parse(localStorage.getItem('site_announcements') || '[]');
  announcements.push({ id: Date.now(), text, date: new Date().toISOString() });
  localStorage.setItem('site_announcements', JSON.stringify(announcements));
  document.getElementById('announcementText').value = '';
  alert('پیام با موفقیت ثبت شد!');
  renderAnnouncements();
}

function deleteAnnouncement(id) {
  let announcements = JSON.parse(localStorage.getItem('site_announcements') || '[]');
  announcements = announcements.filter(a => a.id !== id);
  localStorage.setItem('site_announcements', JSON.stringify(announcements));
  renderAnnouncements();
}

function renderAnnouncements() {
  const announcements = JSON.parse(localStorage.getItem('site_announcements') || '[]');
  const bannerContainer = document.getElementById('notifBannerArea');
  if (!bannerContainer) return;
  if (!announcements.length) { bannerContainer.innerHTML = ''; return; }

  const latest = announcements[announcements.length - 1];
  bannerContainer.innerHTML = `
    <div class="recent-announcement-banner">
      <div style="display: flex; align-items: center; gap: 10px;">
        <span class="announcement-badge">اطلاعیه مهم</span>
        <span><strong>پیام مدیر:</strong> ${latest.text}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <small style="opacity: 0.8; font-size: 0.8rem;">${new Date(latest.date).toLocaleDateString('fa-IR')}</small>
        <button class="delete-notif-btn" onclick="deleteAnnouncement(${latest.id})" title="حذف اعلان">✕</button>
      </div>
    </div>
  `;
}

function fixAparatUrl(url) {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const match = url.match(/\/v\/([a-zA-Z0-9]+)/) || url.match(/videohash\/([a-zA-Z0-9]+)/);
  if (match && match[1]) {
    return `https://www.aparat.com/video/video/embed/videohash/${match[1]}/vt/frame`;
  }
  return url;
}

function createNewCourse() {
  const category = document.getElementById('courseCategory').value || 'دوره عمومی';
  const title = document.getElementById('courseTitle').value;
  const rawUrl = document.getElementById('courseVideoUrl').value;
  const fileInput = document.getElementById('localVideoFile');
  const desc = document.getElementById('courseDesc').value;

  if (!title) return alert('لطفاً عنوان جلسه را وارد کنید');

  const saveCourseData = (videoSource, isLocal = false) => {
    const courses = JSON.parse(localStorage.getItem('site_courses') || '[]');
    courses.push({ id: Date.now(), category, title, videoSource, isLocal, desc });
    localStorage.setItem('site_courses', JSON.stringify(courses));
    alert('جلسه جدید با موفقیت اضافه شد!');
    location.reload();
  };

  if (fileInput.files && fileInput.files[0]) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
      saveCourseData(e.target.result, true);
    };
    reader.readAsDataURL(file);
  } else if (rawUrl) {
    saveCourseData(fixAparatUrl(rawUrl), false);
  } else {
    alert('لطفاً یا لینک آپارات بدهید یا یک فایل ویدیو از سیستم انتخاب کنید');
  }
}

function renderCoursesGrouped() {
  const accordionContainer = document.getElementById('coursesAccordionList');
  if (!accordionContainer) return;

  const courses = JSON.parse(localStorage.getItem('site_courses') || '[]');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!courses.length) {
    accordionContainer.innerHTML = '<p style="color: #64748b; font-size: 0.95rem;">هنوز دوره‌ای اضافه نشده است.</p>';
    return;
  }

  const grouped = {};
  courses.forEach(c => {
    if (!grouped[c.category]) grouped[c.category] = [];
    grouped[c.category].push(c);
  });

  let html = '';
  Object.keys(grouped).forEach((catName, index) => {
    html += `
      <div style="background: white; border-radius: 16px; margin-bottom: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <div style="background: #f8fafc; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0;">
          <button onclick="toggleAccordion('cat-${index}')" style="background: none; border: none; font-size: 1.05rem; font-weight: bold; color: #0284c7; cursor: pointer; text-align: right; flex: 1;">
            📚 ${catName} (${grouped[catName].length} جلسه) <span id="icon-cat-${index}" style="margin-right: 8px;">▼</span>
          </button>
          
          ${isAdmin ? `
            <button onclick="deleteCategory('${catName}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; cursor: pointer;">
              🗑️ حذف کامل این فصل
            </button>
          ` : ''}
        </div>
        
        <div id="cat-${index}" style="display: none; padding: 20px;">
          <div class="videos-grid">
            ${grouped[catName].map(item => `
              <div class="video-card" style="position: relative;">
                <h4 class="video-title">${item.title}</h4>
                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 12px;">${item.desc || ''}</p>
                <div class="aparat-wrapper">
                  ${item.isLocal 
                    ? `<video src="${item.videoSource}" controls style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: contain; background: #000;"></video>` 
                    : `<iframe src="${item.videoSource}" allowfullscreen="true"></iframe>`
                  }
                </div>
                ${isAdmin ? `
                  <button onclick="deleteSingleCourse(${item.id})" style="margin-top: 10px; width: 100%; background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 6px; border-radius: 8px; font-size: 0.85rem; cursor: pointer;">
                    🗑️ حذف این جلسه
                  </button>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  });

  accordionContainer.innerHTML = html;
}

function toggleAccordion(id) {
  const el = document.getElementById(id);
  const icon = document.getElementById('icon-' + id);
  if (!el) return;
  if (el.style.display === 'none' || el.style.display === '') {
    el.style.display = 'block';
    if (icon) icon.innerText = '▲';
  } else {
    el.style.display = 'none';
    if (icon) icon.innerText = '▼';
  }
}

function deleteSingleCourse(id) {
  if (!confirm('آیا از حذف این جلسه مطمئن هستید؟')) return;
  let courses = JSON.parse(localStorage.getItem('site_courses') || '[]');
  courses = courses.filter(c => c.id !== id);
  localStorage.setItem('site_courses', JSON.stringify(courses));
  renderCoursesGrouped();
}

function deleteCategory(catName) {
  if (!confirm(`آیا از حذف کامل فصل "${catName}" و تمام جلسات آن مطمئن هستید؟`)) return;
  let courses = JSON.parse(localStorage.getItem('site_courses') || '[]');
  courses = courses.filter(c => c.category !== catName);
  localStorage.setItem('site_courses', JSON.stringify(courses));
  renderCoursesGrouped();
}
window.addEventListener('scroll', () => {
  const header = document.querySelector('.glass-header');
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});