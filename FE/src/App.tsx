/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header>
        <div className="container header-content">
          <a href="#" className="logo">Echo<span>Work</span></a>
          <ul className="nav-menu">
            <li><a href="#" className="nav-link">Việc làm</a></li>
            <li><a href="#" className="nav-link">Công ty</a></li>
            <li><a href="#" className="nav-link">CV</a></li>
            <li><a href="#" className="nav-link">Hỗ trợ</a></li>
          </ul>
          <div className="header-actions">
            <a href="#login-modal" className="btn btn-outline">Đăng nhập</a>
            <a href="#recruiter-view" className="btn btn-primary">Nhà tuyển dụng</a>
          </div>
        </div>
      </header>

      {/* MODAL: LOGIN & CLASSIFICATION */}
      <div id="login-modal" className="modal-overlay">
        <div className="modal-card">
          <a href="#" className="modal-close">&times;</a>
          <h2 className="classification-title">Chào mừng bạn trở lại!</h2>
          <p className="classification-desc">Vui lòng chọn loại tài khoản để chúng tôi tối ưu hóa trải nghiệm của bạn.</p>
          
          <div className="class-options">
            <label className="class-card">
              <input type="radio" name="user-type" id="type-normal" defaultChecked />
              <i>👤</i>
              <strong>Người dùng bình thường</strong>
            </label>
            <label className="class-card">
              <input type="radio" name="user-type" id="type-pwd" />
              <i>♿</i>
              <strong>Người khuyết tật</strong>
            </label>
          </div>

          <div className="pwd-details">
            <p style={{ fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>Bạn thuộc nhóm đối tượng nào?</p>
            <div className="pwd-grid">
              <div className="pwd-option"><input type="checkbox" /> Khiếm thị</div>
              <div className="pwd-option"><input type="checkbox" /> Khiếm thính</div>
              <div className="pwd-option"><input type="checkbox" /> Vận động</div>
              <div className="pwd-option"><input type="checkbox" /> Khác</div>
            </div>
          </div>

          <a href="#" className="btn btn-primary" style={{ width: '100%', marginTop: '24px' }}>Tiếp tục</a>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="container">
          <h1>Tìm kiếm công việc mơ ước của bạn</h1>
          <p>Hơn 50,000+ việc làm mới mỗi ngày, hỗ trợ tối đa cho mọi đối tượng ứng viên.</p>
          <div className="search-bar">
            <input type="text" placeholder="Tên công việc, vị trí, kỹ năng..." />
            <button className="btn btn-primary">Tìm kiếm</button>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: JOBS & FILTERS */}
      <main className="container main-layout">
        
        {/* Sidebar Filter */}
        <aside className="sidebar">
          <div className="filter-group">
            <h4 className="filter-title">📍 Địa điểm</h4>
            <label className="filter-item"><input type="checkbox" /> Hà Nội</label>
            <label className="filter-item"><input type="checkbox" /> TP. Hồ Chí Minh</label>
            <label className="filter-item"><input type="checkbox" /> Đà Nẵng</label>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">♿ Hỗ trợ Accessibility</h4>
            <label className="filter-item"><input type="checkbox" /> Có lối đi xe lăn</label>
            <label className="filter-item"><input type="checkbox" /> Thang máy đạt chuẩn</label>
            <label className="filter-item"><input type="checkbox" /> Hỗ trợ khiếm thị</label>
            <label className="filter-item"><input type="checkbox" /> Hỗ trợ khiếm thính</label>
            <label className="filter-item"><input type="checkbox" /> Làm việc Remote</label>
          </div>

          <div className="filter-group">
            <h4 className="filter-title">💼 Loại hình</h4>
            <label className="filter-item"><input type="checkbox" /> Toàn thời gian</label>
            <label className="filter-item"><input type="checkbox" /> Bán thời gian</label>
            <label className="filter-item"><input type="checkbox" /> Thực tập</label>
          </div>
        </aside>

        {/* Job List */}
        <section className="job-list">
          {/* Job Card 1 */}
          <div className="job-card">
            <div className="job-info">
              <div className="company-logo">TECH</div>
              <div className="job-details">
                <h3>Senior Frontend Developer (ReactJS)</h3>
                <p className="company-name">Tập đoàn Công nghệ TechVina</p>
                <div className="job-meta">
                  <span>💰 25 - 40 triệu</span>
                  <span>📍 Hà Nội</span>
                </div>
                <div className="job-tags">
                  <span className="tag">Full-time</span>
                  <span className="tag">Remote</span>
                  <span className="tag tag-accessibility">♿ Hỗ trợ xe lăn</span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary">Ứng tuyển ngay</button>
          </div>

          {/* Job Card 2 */}
          <div className="job-card">
            <div className="job-info">
              <div className="company-logo">DESIGN</div>
              <div className="job-details">
                <h3>UI/UX Designer chuyên nghiệp</h3>
                <p className="company-name">Creative Agency Global</p>
                <div className="job-meta">
                  <span>💰 Thỏa thuận</span>
                  <span>📍 TP. Hồ Chí Minh</span>
                </div>
                <div className="job-tags">
                  <span className="tag">Full-time</span>
                  <span className="tag tag-accessibility">👁️ Hỗ trợ khiếm thị</span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary">Ứng tuyển ngay</button>
          </div>

          {/* Job Card 3 */}
          <div className="job-card">
            <div className="job-info">
              <div className="company-logo">DATA</div>
              <div className="job-details">
                <h3>Chuyên viên Phân tích Dữ liệu</h3>
                <p className="company-name">Ngân hàng TMCP Việt Nam</p>
                <div className="job-meta">
                  <span>💰 15 - 25 triệu</span>
                  <span>📍 Đà Nẵng</span>
                </div>
                <div className="job-tags">
                  <span className="tag">Full-time</span>
                  <span className="tag tag-accessibility">🛗 Thang máy chuẩn</span>
                </div>
              </div>
            </div>
            <button className="btn btn-primary">Ứng tuyển ngay</button>
          </div>
        </section>
      </main>

      {/* RECRUITER DASHBOARD SECTION */}
      <section id="recruiter-view" className="recruiter-section">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Recruiter Dashboard</h2>
              <p style={{ color: 'var(--text-muted)' }}>Quản lý tin tuyển dụng và ứng viên của bạn</p>
            </div>
            <button className="btn btn-primary">+ Đăng tin mới</button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">12</div>
              <div className="stat-label">Tin đang tuyển</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">458</div>
              <div className="stat-label">Tổng số ứng viên</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">85%</div>
              <div className="stat-label">Tỷ lệ phản hồi</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">24</div>
              <div className="stat-label">Lượt xem hôm nay</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section className="pricing-section">
        <div className="container">
          <div className="pricing-title">
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>Gói dịch vụ Nhà tuyển dụng</h2>
            <p style={{ color: 'var(--text-muted)' }}>Nâng tầm thương hiệu tuyển dụng và tiếp cận ứng viên tài năng nhất.</p>
          </div>

          <div className="pricing-grid">
            {/* Basic */}
            <div className="pricing-card">
              <h3 className="plan-name">Basic</h3>
              <div className="plan-price">Miễn phí</div>
              <ul className="plan-features">
                <li>Đăng tối đa 3 tin tuyển dụng</li>
                <li>Hiển thị cơ bản</li>
                <li>Quản lý ứng viên cơ bản</li>
              </ul>
              <button className="btn btn-outline">Bắt đầu ngay</button>
            </div>

            {/* Pro */}
            <div className="pricing-card featured">
              <span className="badge">Phổ biến nhất</span>
              <h3 className="plan-name">Pro</h3>
              <div className="plan-price">2.500.000 <span>/tháng</span></div>
              <ul className="plan-features">
                <li>Đăng tin không giới hạn</li>
                <li>Tin tuyển dụng được highlight</li>
                <li>Tiếp cận kho CV 10.000+</li>
                <li>Hỗ trợ lọc Accessibility</li>
              </ul>
              <button className="btn btn-primary">Mua ngay</button>
            </div>

            {/* Premium */}
            <div className="pricing-card">
              <h3 className="plan-name">Premium</h3>
              <div className="plan-price">5.000.000 <span>/tháng</span></div>
              <ul className="plan-features">
                <li>Tất cả tính năng gói Pro</li>
                <li>Quảng cáo banner trang chủ</li>
                <li>Hỗ trợ AI lọc ứng viên</li>
                <li>Chuyên viên hỗ trợ 24/7</li>
              </ul>
              <button className="btn btn-outline">Mua ngay</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="logo">Echo<span>Work</span></div>
          <p>&copy; 2026 EchoWork Việt Nam. All rights reserved.</p>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>Nền tảng tuyển dụng tiên phong hỗ trợ người khuyết tật.</p>
        </div>
      </footer>
    </div>
  );
}

