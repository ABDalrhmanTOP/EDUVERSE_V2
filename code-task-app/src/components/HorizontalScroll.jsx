import React, { useRef, useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaMouse, FaHandPointer } from 'react-icons/fa';
import '../styles/SubscriptionHistory.css';

const HorizontalScroll = ({ children, title = "الاشتراكات" }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // التحقق من إمكانية التمرير
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
      
      // حساب نسبة التمرير
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  // التمرير لليسار
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -350,
        behavior: 'smooth'
      });
    }
  };

  // التمرير لليمين
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 350,
        behavior: 'smooth'
      });
    }
  };

  // التمرير إلى مؤشر معين
  const scrollToIndex = (index) => {
    if (scrollRef.current) {
      const cardWidth = 350 + 32; // عرض البطاقة + المسافة
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  // التمرير باستخدام الكيبورد
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollLeft();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollRight();
    }
  };

  // مراقبة التمرير
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      checkScroll();
      scrollElement.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      window.addEventListener('keydown', handleKeyDown);
      
      return () => {
        scrollElement.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  // حساب عدد البطاقات
  const totalCards = React.Children.count(children);
  const dots = Array.from({ length: Math.ceil(totalCards / 2) }, (_, i) => i);

  return (
    <div className="horizontal-scroll-container">
      {/* عنوان القسم */}
      {title && (
        <div className="section-title">
          <h3 className="text-heading">{title}</h3>
        </div>
      )}

      {/* أزرار التنقل المحسنة */}
      <div className="scroll-nav">
        <button
          className="scroll-btn"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
          aria-label="تمرير لليسار"
          title="تمرير لليسار (السهم الأيسر)"
        >
          <FaChevronLeft />
        </button>
        
        <div className="scroll-info">
          <span className="scroll-text">استخدم الأزرار أو الأسهم للتنقل</span>
          <div className="scroll-icons">
            <FaMouse className="scroll-icon" />
            <FaHandPointer className="scroll-icon" />
          </div>
        </div>
        
        <button
          className="scroll-btn"
          onClick={scrollRight}
          disabled={!canScrollRight}
          aria-label="تمرير لليمين"
          title="تمرير لليمين (السهم الأيمن)"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* مؤشر التمرير المخصص */}
      <div className="custom-scrollbar">
        <div 
          className="scrollbar-track" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* حاوية التمرير */}
      <div 
        ref={scrollRef}
        className="horizontal-scroll-wrapper"
        onScroll={checkScroll}
        tabIndex={0}
        role="region"
        aria-label="قائمة الاشتراكات"
      >
        {children}
      </div>

      {/* مؤشرات التمرير */}
      {totalCards > 2 && (
        <div className="scroll-indicator">
          {dots.map((dotIndex) => (
            <button
              key={dotIndex}
              className={`scroll-dot ${currentIndex === dotIndex ? 'active' : ''}`}
              onClick={() => scrollToIndex(dotIndex)}
              aria-label={`انتقل إلى الصفحة ${dotIndex + 1}`}
              title={`الصفحة ${dotIndex + 1}`}
            />
          ))}
        </div>
      )}

      {/* تعليمات التمرير المحسنة */}
      <div className="scroll-instructions">
        <p>
          💡 يمكنك التمرير أفقياً أو استخدام الأزرار للتنقل بين الاشتراكات
          <br />
          <small>استخدم الأسهم في الكيبورد ← → للتنقل السريع</small>
        </p>
      </div>
    </div>
  );
};

export default HorizontalScroll; 