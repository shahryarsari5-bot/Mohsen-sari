// ==========================================
// ۱. انیمیشن اسکرول هدر و دکمه شناور برگشت به بالا
// ==========================================
window.addEventListener('scroll', function() {
  // ۱. جمع‌تر شدن هدر هنگام اسکرول
  const headerWrapper = document.querySelector('.header-wrapper') || document.querySelector('header');
  if (headerWrapper) {
    if (window.scrollY > 40) {
      headerWrapper.classList.add('scrolled');
    } else {
      headerWrapper.classList.remove('scrolled');
    }
  }

  // ۲. نمایش دکمه برگشت به بالا
  const scrollTopBtn = document.getElementById('scrollTopBtn') || document.querySelector('.scroll-to-top');
  if (scrollTopBtn) {
    if (window.scrollY > 150) {
      scrollTopBtn.classList.add('show');
    } else {
      scrollTopBtn.classList.remove('show');
    }
  }
});

// ==========================================
// ۲. مدیریت مودال و ورود مدیر
// ==========================================
function openLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'flex';
}

function closeLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.style.display = 'none';
}

window.addEventListener('click', function (e) {
  const modal = document.getElementById('loginModal');
  if (e.target === modal) closeLoginModal();
});

function checkLogin() {
  const user = document.getElementById('adminUser')?.value || document.getElementById('username')?.value;
  const pass = document.getElementById('adminPass')?.value || document.getElementById('password')?.value;

  if (user === 'admin' && pass === 'admin123') {
    alert('ورود با موفقیت انجام شد!');
    closeLoginModal();
    localStorage.setItem('isAdmin', 'true');
    updateAdminUI();
  } else {
    alert('نام کاربری یا رمز عبور اشتباه است!');
  }
}

function updateAdminUI() {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminElements = document.querySelectorAll('.admin-only');
  
  adminElements.forEach(el => {
    el.style.display = isAdmin ? 'block' : 'none';
  });

  const adminBtn = document.getElementById('adminNavBtn');
  if (adminBtn) {
    if (isAdmin) {
      adminBtn.innerText = 'خروج از مدیریت';
      adminBtn.onclick = function() {
        localStorage.removeItem('isAdmin');
        alert('از حساب مدیریت خارج شدید.');
        location.reload();
      };
    }
  }
}

// ==========================================
// ۳. مدیریت بخش پیام‌ها (ذخیره، نمایش و حذف)
// ==========================================
function saveMessage(e) {
  if (e) e.preventDefault();
  
  const senderInput = document.getElementById('senderName');
  const textInput = document.getElementById('messageText');

  if (!senderInput || !textInput) return;

  const sender = senderInput.value.trim();
  const text = textInput.value.trim();
  
  if (!sender || !text) return;

  const newMessage = {
    id: Date.now(),
    sender: sender,
    text: text,
    date: new Date().toLocaleDateString('fa-IR')
  };

  let messages = JSON.parse(localStorage.getItem('site_messages')) || [];
  messages.unshift(newMessage);
  localStorage.setItem('site_messages', JSON.stringify(messages));

  const messageForm = document.getElementById('messageForm');
  if (messageForm) messageForm.reset();
  
  displayMessages();
}

function displayMessages() {
  const container = document.getElementById('messagesContainer');
  if (!container) return;

  let messages = JSON.parse(localStorage.getItem('site_messages')) || [];

  if (messages.length === 0) {
    container.innerHTML = '<p class="no-messages">هنوز هیچ پیامی ثبت نشده است.</p>';
    return;
  }

  container.innerHTML = messages.map(msg => `
    <div class="message-card">
      <div class="message-header">
        <strong>${msg.sender}</strong>
        <span class="message-date">${msg.date}</span>
      </div>
      <p class="message-body">${msg.text}</p>
      <button onclick="deleteMessage(${msg.id})" class="btn-delete-msg">حذف پیام</button>
    </div>
  `).join('');
}

function deleteMessage(id) {
  if (confirm('آیا از حذف این پیام مطمئن هستید؟')) {
    let messages = JSON.parse(localStorage.getItem('site_messages')) || [];
    messages = messages.filter(msg => msg.id !== id);
    localStorage.setItem('site_messages', JSON.stringify(messages));
    displayMessages();
  }
}

// ==========================================
// ۴. سیستم هوشمند اسلایدر پویای صفحه اصلی
// ==========================================
const BACKUP_IMAGES = [
  "https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1112080/pexels-photo-1112080.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/158179/cows-pasture-sky-clouds-158179.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/36347/cow-pasture-animal-nature.jpg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/1321124/pexels-photo-1321124.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/62321/cow-head-livestock-milk-62321.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/460257/pexels-photo-460257.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/2252551/pexels-photo-2252551.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/235725/pexels-photo-235725.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/101852/pexels-photo-101852.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/2647053/pexels-photo-2647053.jpeg?auto=compress&cs=tinysrgb&w=1200"
];

function getUniqueBackupImage(existingSlides) {
  const usedImages = (existingSlides || []).map(s => s.image);
  const availableImages = BACKUP_IMAGES.filter(img => !usedImages.includes(img));

  if (availableImages.length > 0) {
    const index = Math.floor(Math.random() * availableImages.length);
    return availableImages[index];
  }
  const randomIndex = Math.floor(Math.random() * BACKUP_IMAGES.length);
  return BACKUP_IMAGES[randomIndex];
}

function addSlideToSlider(newItem) {
  let slides = JSON.parse(localStorage.getItem('homeSlides')) || [];
  
  slides.unshift({
    id: Date.now(),
    title: newItem.title,
    tag: newItem.tag || 'دوره جدید',
    image: newItem.image || getUniqueBackupImage(slides),
    date: new Date().toLocaleDateString('fa-IR')
  });

  if (slides.length > 7) {
    slides = slides.slice(0, 7);
  }

  localStorage.setItem('homeSlides', JSON.stringify(slides));
  renderHomeSlider();
}

function renderHomeSlider() {
  const track = document.getElementById('sliderTrack');
  const dotsContainer = document.getElementById('sliderDots');
  if (!track || !dotsContainer) return;

  let slides = JSON.parse(localStorage.getItem('homeSlides')) || [];

  if (slides.length === 0) {
    slides = [
      { title: "به وبسایت تخصصی مدیریت و تغذیه گله‌های گاو شیری خوش آمدید", tag: "خوش‌آمدگویی", image: BACKUP_IMAGES[0] },
      { title: "راهکارهای مدرن کاهش استرس گرمایی در مزارع پرورش صنعتی", tag: "اطلاعیه مهم", image: BACKUP_IMAGES[1] },
      { title: "تازه‌ترین یافته‌ها درباره مدیریت بهداشت و پرورش گوساله تازه متولد شده", tag: "مقالات جدید", image: BACKUP_IMAGES[2] }
    ];
  }

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  slides.forEach((slide, idx) => {
    const slideDiv = document.createElement('div');
    slideDiv.className = 'slide-item';
    slideDiv.innerHTML = `
      <img src="${slide.image}" alt="${slide.title}">
      <div class="slide-caption">
        <span class="slide-tag">${slide.tag}</span>
        <h3>${slide.title}</h3>
      </div>
    `;
    track.appendChild(slideDiv);

    const dot = document.createElement('span');
    dot.className = `dot ${idx === 0 ? 'active' : ''}`;
    dot.setAttribute('onclick', `currentSlide(${idx})`);
    dotsContainer.appendChild(dot);
  });
}

// ==========================================
// ۵. مدیریت ثبت دوره و اتصال به اسلایدر خانه
// ==========================================
function createNewCourse() {
  const category = document.getElementById('courseCategory')?.value.trim();
  const title = document.getElementById('courseTitle')?.value.trim();
  const videoUrl = document.getElementById('courseVideoUrl')?.value.trim();
  const localFile = document.getElementById('localVideoFile')?.files[0];
  const desc = document.getElementById('courseDesc')?.value.trim();
  
  const useVideoFrame = document.getElementById('useVideoFrameCheck')?.checked;
  const showInSlider = document.getElementById('showInSliderCheck')?.checked;

  if (!category || !title) {
    alert('لطفاً حداقل نام دوره و عنوان جلسه را وارد کنید.');
    return;
  }

  let finalVideoSrc = videoUrl;
  if (localFile) {
    finalVideoSrc = URL.createObjectURL(localFile);
  }

  const newSession = {
    id: Date.now(),
    category,
    title,
    videoUrl: finalVideoSrc,
    desc
  };

  // ذخیره دوره در localStorage
  let courses = JSON.parse(localStorage.getItem('site_courses')) || [];
  courses.unshift(newSession);
  localStorage.setItem('site_courses', JSON.stringify(courses));

  // اگر تیک "نمایش در اسلایدر" خورده بود، اضافه کن به اسلایدر خانه
  if (showInSlider) {
    if (useVideoFrame && localFile) {
      // گرفتن ثانیه اول ویدیو
      const video = document.createElement('video');
      video.src = finalVideoSrc;
      video.currentTime = 1;
      video.onloadeddata = function() {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 675;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frameUrl = canvas.toDataURL('image/jpeg');

        addSlideToSlider({
          title: `${category} - ${title}`,
          tag: 'دوره جدید',
          image: frameUrl
        });
      };
    } else {
      // عکس تصادفی زاپاس
      addSlideToSlider({
        title: `${category} - ${title}`,
        tag: 'دوره جدید'
      });
    }
  }

  alert('جلسه جدید با موفقیت ثبت شد!');
  
  // پاکسازی فرم
  document.getElementById('courseCategory').value = '';
  document.getElementById('courseTitle').value = '';
  if (document.getElementById('courseVideoUrl')) document.getElementById('courseVideoUrl').value = '';
  if (document.getElementById('localVideoFile')) document.getElementById('localVideoFile').value = '';
  if (document.getElementById('courseDesc')) document.getElementById('courseDesc').value = '';

  renderCoursesAccordion();
}

function renderCoursesAccordion() {
  const container = document.getElementById('coursesAccordionList');
  if (!container) return;

  let courses = JSON.parse(localStorage.getItem('site_courses')) || [];
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (courses.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#64748b; padding:20px;">هنوز هیچ دوره‌ای ثبت نشده است.</p>';
    return;
  }

  // دسته‌بندی بر اساس category
  const categories = {};
  courses.forEach(item => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push(item);
  });

  let html = '';
  for (const cat in categories) {
    html += `
      <div style="background:#fff; border-radius:18px; margin-bottom:20px; padding:20px; border:1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:2px solid #f1f5f9; padding-bottom:10px;">
          <h3 style="color:#0284c7; font-size:1.15rem; margin:0;">📚 ${cat}</h3>
          ${isAdmin ? `<button onclick="deleteCategory('${cat}')" style="background:#ef4444; color:#fff; border:none; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:0.8rem; font-weight:bold;">🗑️ حذف کل این فصل</button>` : ''}
        </div>
        <div style="display:flex; flex-direction:column; gap:15px;">
    `;
    
    categories[cat].forEach(session => {
      html += `
        <div style="background:#f8fafc; padding:15px; border-radius:12px; border:1px solid #cbd5e1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <h4 style="color:#0f172a; margin:0; font-size:1rem;">${session.title}</h4>
            ${isAdmin ? `<button onclick="deleteSession(${session.id})" style="background:#f87171; color:#fff; border:none; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:0.75rem;">حذف جلسه</button>` : ''}
          </div>
          <p style="color:#475569; font-size:0.9rem; margin-bottom:10px; line-height:1.6;">${session.desc || 'بدون توضیحات'}</p>
          ${session.videoUrl ? `<video src="${session.videoUrl}" controls style="width:100%; max-height:360px; border-radius:10px; background:#000;"></video>` : ''}
        </div>
      `;
    });

    html += `</div></div>`;
  }

  container.innerHTML = html;
}

// تابع حذف یک جلسه خاص
function deleteSession(id) {
  if (confirm('آیا از حذف این جلسه مطمئن هستید؟')) {
    let courses = JSON.parse(localStorage.getItem('site_courses')) || [];
    courses = courses.filter(item => item.id !== id);
    localStorage.setItem('site_courses', JSON.stringify(courses));
    renderCoursesAccordion();
  }
}

// تابع حذف کامل یک فصل/دوره
function deleteCategory(categoryName) {
  if (confirm(`آیا از حذف کامل فصل "${categoryName}" و تمام جلسات آن مطمئن هستید؟`)) {
    let courses = JSON.parse(localStorage.getItem('site_courses')) || [];
    courses = courses.filter(item => item.category !== categoryName);
    localStorage.setItem('site_courses', JSON.stringify(courses));
    renderCoursesAccordion();
  }
}

// ==========================================
// ۶. اجرای توابع هنگام بارگذاری کامل DOM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateAdminUI();
  displayMessages();
  renderHomeSlider();
  renderCoursesAccordion();
});