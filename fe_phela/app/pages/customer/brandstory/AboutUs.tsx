import React from 'react'
import Header from '~/components/customer/Header'
import Footer from '~/components/customer/Footer'
import camhung from '~/assets/images/cam-hung.jpg'
import thucong from '~/assets/images/thu-cong.jpg'
import trachnhiem from '~/assets/images/trach-nhiem.jpg'

const AboutUs = () => {
  return (
    <div className="text-white">
      <div className="fixed top-0 left-0 w-full bg-[#1f120b] shadow-md z-50">
        <Header />
      </div>
      
      {/* Hero Banner */}
      <div className="bg-[#1f120b] py-28 mt-14 border-y border-[#3d1d11]">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-black uppercase text-white tracking-tighter italic">Về <span className="text-[#d48437]">Phê La</span></h1>
          <p className="mt-4 text-[#d48437] font-black uppercase tracking-[0.4em] text-[10px]">Hành trình của nốt hương đặc sản</p>
        </div>
      </div>
      
      {/* Our Story */}
      <div className="container mx-auto py-32 px-4 md:px-8 flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">"Nốt Hương <span className="text-[#d48437]">Đặc Sản"</span></h2>
          <p className="text-white/60 mb-6 font-bold leading-relaxed text-lg">
            Phê La luôn trân quý, nâng niu những giá trị Nguyên Bản ở mỗi vùng đất mà chúng tôi đi qua, nơi tâm 
            hồn được đồng điệu với thiên nhiên, với nỗi vất vả nhọc nhằn của người nông dân; cảm nhận được hết 
            thấy những tầng hương ẩn sâu trong từng nguyên liệu.
          </p>
          <p className="text-white/60 font-bold leading-relaxed text-lg">
            Một chặng đường dài đang chờ phía trước, Phê La đã sẵn sàng viết tiếp câu chuyện Nốt Hương Đặc 
            Sản - Nguyên Bản - Thủ Công đầy cảm hứng và càng tự hào hơn khi được mang sứ mệnh: "Đánh thức 
            những nốt hương đặc sản của nông sản Việt Nam".
          </p>
        </div>
        <div className="md:w-1/2">
          <img 
            src="https://phela.vn/wp-content/uploads/2021/07/HH_3783-600x400.jpg" 
            alt="Phê La Coffee Cups" 
            className="w-full rounded-[3rem] shadow-2xl brightness-90 hover:brightness-100 transition-all border border-[#3d1d11]"
          />
        </div>
      </div>
      
      {/* Mission & Vision */}
      <div className="bg-[#1f120b] py-24 border-y border-[#3d1d11]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-20 text-center">
            <div className="group">
              <div className="flex justify-center mb-8 transform group-hover:scale-110 transition-transform grayscale brightness-200 opacity-50">
                <img src="https://phela.vn/wp-content/uploads/2021/09/eyes.png" alt="Tầm nhìn" className="w-16 h-16 object-contain" />
              </div>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-[#d48437]">Tầm nhìn</h3>
              <p className="text-white/60 font-bold leading-relaxed text-lg max-w-sm mx-auto">
                Mang nguồn nông sản cao cấp của Việt Nam tiếp cận gần hơn với mọi 
                người và vươn ra thế giới.
              </p>
            </div>
            <div className="group">
              <div className="flex justify-center mb-8 transform group-hover:scale-110 transition-transform grayscale brightness-200 opacity-50">
                <img src="https://phela.vn/wp-content/uploads/2021/09/Dm.png" alt="Sứ mệnh" className="w-16 h-16 object-contain" />
              </div>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-widest text-[#d48437]">Sứ mệnh</h3>
              <p className="text-white/60 font-bold leading-relaxed text-lg max-w-sm mx-auto">
                Đồng hành cùng người nông dân trong quá trình sản xuất và phát 
                triển bền vững nguồn nguyên liệu đặc sản.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Core Values */}
      <div className="container mx-auto py-32 px-4 md:px-8">
        <h2 className="text-5xl font-black text-center mb-32 uppercase tracking-tighter italic">Giá trị <span className="text-[#d48437]">cốt lõi</span></h2>
        
        <div className="space-y-40">
          {/* Value 1 */}
          <div className="flex flex-col md:flex-row items-center gap-16 group">
            <div className="md:w-1/2">
              <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-[#d48437]">Thủ công</h3>
              <p className="text-white/60 font-bold leading-relaxed text-lg">
                Tại Phê La, sự tâm huyết, tỉ mỉ và tinh tế được thể hiện qua từng sản phẩm. Những là trà ô long được thu hoạch và sơ chế thủ công, kết hợp cùng việc nghiên cứu và sáng tạo, Phê La đã cho nên những sản phẩm mang hương vị nguyên bản và chân thật nhất.
              </p>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-[#d48437]/10 rounded-[3rem] blur-2xl group-hover:bg-[#d48437]/20 transition-all opacity-0 group-hover:opacity-100"></div>
              <img 
                src={thucong}
                alt="Thủ công tại Phê La" 
                className="w-full rounded-[2.5rem] shadow-2xl relative border border-[#3d1d11]"
              />
            </div>
          </div>
          
          {/* Value 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 group">
            <div className="md:w-1/2">
              <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-[#d48437]">Quan tâm</h3>
              <p className="text-white/60 font-bold leading-relaxed text-lg">
                Trải nghiệm của từng khách hàng là tiêu chí hàng đầu của Phê La. Đó cũng là lý do mọi dịch vụ, sản phẩm của Phê La luôn xoay quanh yếu tố con người. Phê La tin rằng, khách hàng – hay rộng hơn là cộng đồng sẽ luôn sát cánh cùng thương hiệu và lan tỏa những giá trị tốt đẹp đến xã hội.
              </p>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-[#d48437]/10 rounded-[3rem] blur-2xl group-hover:bg-[#d48437]/20 transition-all opacity-0 group-hover:opacity-100"></div>
              <img 
                src="https://phela.vn/wp-content/uploads/2023/04/326386567_2808509185946106_3255994807608296453_n.jpg" 
                alt="Quan tâm tại Phê La" 
                className="w-full rounded-[2.5rem] shadow-2xl relative border border-[#3d1d11]"
              />
            </div>
          </div>
          
          {/* Value 3 */}
          <div className="flex flex-col md:flex-row items-center gap-16 group">
            <div className="md:w-1/2">
              <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-[#d48437]">Cảm hứng</h3>
              <p className="text-white/60 font-bold leading-relaxed text-lg">
                Mỗi sản phẩm, chiến dịch của Phê La đều được xây dựng dựa theo những người cảm hứng mà đã đi bên đi trong cuộc sống. Với Phê La, đó là nơi lưu giữ của những điều mới mẻ và kết nối những tâm hồn đồng điệu nhưng vẫn mang cá tính riêng biệt.
              </p>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-[#d48437]/10 rounded-[3rem] blur-2xl group-hover:bg-[#d48437]/20 transition-all opacity-0 group-hover:opacity-100"></div>
              <img src={camhung} className="w-full rounded-[2.5rem] shadow-2xl relative border border-[#3d1d11]" alt="Cảm hứng tại Phê La" />
            </div>
          </div>
          
          {/* Value 4 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-16 group">
            <div className="md:w-1/2">
              <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-[#d48437]">Trách nhiệm</h3>
              <p className="text-white/60 font-bold leading-relaxed text-lg">
                Phê La mong muốn tạo ra điều mà được ở Làng đã cảm thụ lại cảm cùng người nông dân và đề cao sự phát triển bền vững của nguồn nguyên liệu. Điều chúng tôi tin rằng đây sẽ là bước đệm vững chắc giúp Phê La ghi thêu rõng nét đặc sản của người Việt tới cộng đồng và vươn ra thế giới.
              </p>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-[#d48437]/10 rounded-[3rem] blur-2xl group-hover:bg-[#d48437]/20 transition-all opacity-0 group-hover:opacity-100"></div>
              <img src={trachnhiem} className="w-full rounded-[2.5rem] shadow-2xl relative border border-[#3d1d11]" alt="Trách nhiệm tại Phê La" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements */}
      <div className="bg-[#1f120b] py-24 border-y border-[#3d1d11]">
        <div className="container mx-auto px-4 md:px-8">
          <h2 className="text-4xl font-black text-center mb-20 uppercase tracking-tight italic">Thành tựu <span className="text-[#d48437]">đáng tự hào</span></h2>
          
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="p-8 rounded-[2.5rem] bg-[#2b1b12] border border-[#3d1d11] hover:border-[#d48437]/30 transition-all">
              <h3 className="text-5xl font-black mb-4 text-[#d48437] tracking-tighter italic">210.000+</h3>
              <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">Sản phẩm bán ra</p>
              <p className="text-white/40 text-sm leading-relaxed">
                trong vòng 5 tháng kinh doanh trong tình hình dịch bệnh căng thẳng
              </p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-[#2b1b12] border border-[#3d1d11] hover:border-[#d48437]/30 transition-all">
              <h3 className="text-5xl font-black mb-4 text-[#d48437] tracking-tighter italic">5836</h3>
              <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">Lượt nhắc tên</p>
              <p className="text-white/40 text-sm leading-relaxed">
                trên MXH Facebook và Instagram (theo báo cáo Sprout Social)
              </p>
            </div>
            <div className="p-8 rounded-[2.5rem] bg-[#2b1b12] border border-[#3d1d11] hover:border-[#d48437]/30 transition-all">
              <h3 className="text-5xl font-black mb-4 text-[#d48437] tracking-tighter italic">98%</h3>
              <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mb-4">Khách hàng hài lòng</p>
              <p className="text-white/40 text-sm leading-relaxed">
                về chất lượng sản phẩm và dịch vụ (theo đánh giá Baemin/Shopee)
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto py-32">
            <h3 className="text-2xl font-black text-center mb-24 uppercase tracking-[0.3em] text-[#d48437]">Hành trình <span className="text-white">Kiến tạo</span></h3>
            
            <div className="relative">
              {/* Timeline Line */}
              <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-[#d48437]/20 shadow-[0_0_20px_rgba(212,132,55,0.2)]"></div>
              
              {/* Timeline Events */}
              <div className="space-y-16">
                {/* Event 1 */}
                <div className="flex flex-col md:flex-row md:items-center group">
                  <div className="md:w-1/2 md:pr-12 md:text-right">
                    <div className="bg-[#2b1b12] rounded-[2rem] border border-[#3d1d11] p-8 hover:border-[#d48437]/50 transition-all group-hover:-translate-x-2">
                      <span className="text-[#d48437] font-black uppercase tracking-widest text-xs">8/2020</span>
                      <h4 className="text-xl font-black mt-3 mb-3 text-white uppercase italic">Bước chân đầu tiên</h4>
                      <p className="text-white/40 font-bold leading-relaxed">
                        Thương hiệu Phê La được đăng ký bảo hộ độc quyền tại Việt Nam
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center relative z-10">
                    <div className="w-5 h-5 rounded-full bg-[#d48437] border-4 border-[#1f120b] shadow-[0_0_20px_rgba(212,132,55,0.5)] group-hover:scale-125 transition-transform"></div>
                  </div>
                  <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0"></div>
                </div>
                
                {/* Event 2 */}
                <div className="flex flex-col md:flex-row md:items-center group">
                  <div className="md:w-1/2 md:pr-12"></div>
                  <div className="hidden md:flex items-center justify-center relative z-10">
                    <div className="w-5 h-5 rounded-full bg-[#d48437] border-4 border-[#1f120b] shadow-[0_0_20px_rgba(212,132,55,0.5)] group-hover:scale-125 transition-transform"></div>
                  </div>
                  <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0">
                    <div className="bg-[#2b1b12] rounded-[2rem] border border-[#3d1d11] p-8 hover:border-[#d48437]/50 transition-all group-hover:translate-x-2">
                      <span className="text-[#d48437] font-black uppercase tracking-widest text-xs">9/3/2021</span>
                      <h4 className="text-xl font-black mt-3 mb-3 text-white uppercase italic">Ra mắt thị trường</h4>
                      <p className="text-white/40 font-bold leading-relaxed">
                        Phê La chính thức ra mắt với cửa hàng đầu tiên tại Phạm Ngọc Thạch
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Event 3 */}
                <div className="flex flex-col md:flex-row md:items-center group">
                  <div className="md:w-1/2 md:pr-12 md:text-right">
                    <div className="bg-[#2b1b12] rounded-[2rem] border border-[#3d1d11] p-8 hover:border-[#d48437]/50 transition-all group-hover:-translate-x-2">
                      <span className="text-[#d48437] font-black uppercase tracking-widest text-xs">15/3/2021</span>
                      <h4 className="text-xl font-black mt-3 mb-3 text-white uppercase italic">Số hoá thương hiệu</h4>
                      <p className="text-white/40 font-bold leading-relaxed">
                        Hiện diện trên các nền tảng giao hàng hàng đầu Baemin and Shopee Food
                      </p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center relative z-10">
                    <div className="w-5 h-5 rounded-full bg-[#d48437] border-4 border-[#1f120b] shadow-[0_0_20px_rgba(212,132,55,0.5)] group-hover:scale-125 transition-transform"></div>
                  </div>
                  <div className="md:w-1/2 md:pl-12 mt-4 md:mt-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default AboutUs