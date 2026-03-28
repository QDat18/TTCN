import React from 'react';
import Header from '~/components/customer/Header';
import Footer from '~/components/customer/Footer';

const DifferentStyle = () => {
  return (
    <div className="min-h-screen flex flex-col text-white">
      <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-50">
        <Header />
      </div>

      <main className="flex-grow mt-14">
        {/* Hero Image */}
        <div className="w-full relative h-[40vh] overflow-hidden">
          <img
            src="https://phela.vn/wp-content/uploads/2021/08/DSC09515.jpg"
            alt="Phong cách khác biệt"
            className="w-full h-full object-cover brightness-50"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
             <h1 className="text-5xl font-black uppercase tracking-tighter italic">Phong cách <span className="text-[#d48437]">Khác biệt</span></h1>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-[#d48437] mb-12 font-black uppercase tracking-[0.4em] text-[10px] text-center">
            26 • 08 • 2021
          </div>

          <div className="prose-invert max-w-none text-justify pb-16">
            <p className="text-xl leading-relaxed font-bold text-white/80">
              Đi theo concept Cắm Trại - phong cách khác biệt so với các thương hiệu khác trên thị trường, Phê La đã tạo ra ấn tượng mạnh mẽ cho khách hàng nhờ những chất riêng và thiết kế độc đáo của mình.
            </p>
          </div>

          <div className="group space-y-4">
            <div className="rounded-[2.5rem] overflow-hidden border border-[#3d1d11] shadow-2xl relative">
                <img src="https://phela.vn/wp-content/uploads/2021/08/phong-cach-camping-1.jpg" alt="Cắm trại" className="w-full group-hover:scale-105 transition-all duration-1000 brightness-90 group-hover:brightness-100" />
            </div>
            <p className='py-4 text-white/30 italic text-center text-xs uppercase tracking-widest font-black'>Tông màu trầm ấm mang đến cảm giác thoải mái, gần gũi</p>
          </div>

          <div className="prose-invert max-w-none text-justify py-16">
            <p className="text-lg leading-relaxed text-white/60 font-medium">
              Trong mỗi góc nhỏ tại Phê La đều có sự xuất hiện của ghế dù và bàn xếp, kết hợp với tone màu nâu trầm ấm làm chủ đạo, Phê La mong muốn sẽ mang lại không gian thưởng thức thoải mái, gần gũi và mộc mạc nhất cho khách hàng. Cũng chính bởi sự nguyên sơ này, khách hàng như được hoà mình vào thiên nhiên để tâm tình, thủ thỉ vài ba câu chuyện nhỏ bên những cốc trà, và bỏ lại những suy nghĩ mệt mỏi, xô bồ của cuộc sống.
            </p>
          </div>

          <div className="group space-y-4">
            <div className="rounded-[2.5rem] overflow-hidden border border-[#3d1d11] shadow-2xl relative">
                <img src="https://phela.vn/wp-content/uploads/2021/08/phong-cach-camping-2.jpg" alt="Cắm trại" className="w-full group-hover:scale-105 transition-all duration-1000 brightness-90 group-hover:brightness-100" />
            </div>
            <p className='py-4 text-white/30 italic text-center text-xs uppercase tracking-widest font-black'>Trải nghiệm cắm trại giữa lòng thành phố</p>
          </div>

          <div className="prose-invert max-w-none text-justify pt-16">
            <p className="text-lg leading-relaxed text-white/60 font-medium italic border-l-4 border-[#d48437] pl-8">
              Có thể nói, đây là phong cách khác biệt độc đáo của Phê La khi hướng mình tới một concept không gian hoàn toàn mới. Đây không phải là nơi phù hợp để bạn làm việc hay nghiên cứu, mà là nơi bạn được là chính mình, được giải toả áp lực, được thư giãn và được ‘chill’. Cùng khám phá một không gian mới mẻ và đầy thú vị.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DifferentStyle;