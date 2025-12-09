import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Smartphone, 
  User, 
  Menu, 
  X, 
  CheckCircle, 
  ArrowRight,
  Apple,
  Activity,
  Heart
} from 'lucide-react';

export default function AyurCareLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Design Tokens (Inline approach to guarantee no external conflicts)
  const colors = {
    primary: '#5D8736', // Deep Ayurvedic Green
    secondary: '#8D6E63', // Earthy Brown
    accent: '#F4E7D3', // Parchment/Cream
    text: '#2C3E50',
    white: '#ffffff',
    lightGreen: '#E8F5E9'
  };

  const fonts = {
    heading: '"Playfair Display", Georgia, serif',
    body: '"Lato", -apple-system, sans-serif'
  };

  return (
    <div className="ac_wrapper" style={{ fontFamily: fonts.body, color: colors.text, backgroundColor: colors.white, overflowX: 'hidden' }}>
      
      {/* Scoped Styles for Responsiveness (Namespaced to 'ac_' to avoid conflicts) */}
      <style>{`
        /* Reset specific to this component */
        .ac_wrapper * { box-sizing: border-box; }
        
        .ac_container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .ac_btn {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .ac_btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        /* Navigation Responsive */
        .ac_nav_links { display: flex; gap: 30px; align-items: center; }
        .ac_mobile_menu { display: none; }
        
        @media (max-width: 768px) {
          .ac_nav_links { display: none; }
          .ac_mobile_menu { display: block; }
          .ac_hero_content { flex-direction: column; text-align: center; }
          .ac_hero_text { margin-bottom: 40px; }
          .ac_grid_3 { grid-template-columns: 1fr !important; }
          .ac_app_section { flex-direction: column-reverse; text-align: center; }
        }

        .ac_grid_3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        /* Animations */
        @keyframes ac_float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .ac_floating { animation: ac_float 6s ease-in-out infinite; }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.05)' : 'none',
        padding: '20px 0',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}>
        <div className="ac_container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '24px', color: colors.primary, fontFamily: fonts.heading }}>
            <Leaf size={28} />
            <span>AyurCare</span>
          </div>

          {/* Desktop Links */}
          <div className="ac_nav_links">
            {['Home', 'Dosha Quiz', 'Features', 'Testimonials'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} style={{ textDecoration: 'none', color: colors.text, fontWeight: '500' }}>
                {item}
              </a>
            ))}
            <button className="ac_btn" style={{
              padding: '10px 24px',
              borderRadius: '50px',
              border: `2px solid ${colors.primary}`,
              backgroundColor: 'transparent',
              color: colors.primary,
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <User size={18} /> Login
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="ac_mobile_menu">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text }}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            padding: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            alignItems: 'center'
          }}>
            {['Home', 'Dosha Quiz', 'Features', 'Testimonials'].map((item) => (
              <a key={item} href="#" style={{ textDecoration: 'none', color: colors.text, fontSize: '18px' }}>{item}</a>
            ))}
            <button style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              fontWeight: 'bold'
            }}>Login</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="ac_container ac_hero_content" style={{
        paddingTop: '140px',
        paddingBottom: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '50px',
        minHeight: '90vh'
      }}>
        <div className="ac_hero_text" style={{ flex: 1 }}>
          <span style={{ 
            display: 'inline-block', 
            padding: '6px 16px', 
            backgroundColor: colors.lightGreen, 
            color: colors.primary, 
            borderRadius: '20px', 
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: '20px'
          }}>
            #1 Ayurvedic Diet Management System
          </span>
          <h1 style={{ 
            fontFamily: fonts.heading, 
            fontSize: 'clamp(40px, 5vw, 64px)', 
            lineHeight: '1.1', 
            color: '#1a1a1a', 
            marginBottom: '25px' 
          }}>
            Harmony in Diet,<br />
            <span style={{ color: colors.primary }}>Healing in Life.</span>
          </h1>
          <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6', marginBottom: '35px', maxWidth: '500px' }}>
            Discover personalized diet plans based on your unique Prakriti (Body Constitution). Ancient wisdom meets modern technology to keep you healthy.
          </p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button className="ac_btn" style={{
              padding: '16px 32px',
              backgroundColor: colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 10px 25px rgba(93, 135, 54, 0.3)'
            }}>
              Get Your Diet Plan
            </button>
            <button className="ac_btn" style={{
              padding: '16px 32px',
              backgroundColor: 'white',
              color: colors.text,
              border: '1px solid #ddd',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              Download App <Smartphone size={20} />
            </button>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div style={{ flex: 1, position: 'relative' }}>
            {/* Abstract Decorative blobs */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '400px',
                height: '400px',
                backgroundColor: '#F1F8E9',
                borderRadius: '50%',
                zIndex: -1
            }}></div>
            <div className="ac_floating" style={{
                backgroundColor: 'white',
                borderRadius: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                padding: '20px',
                position: 'relative'
            }}>
                {/* Mock UI Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <User />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Pitta-Vata Dominant</div>
                        <div style={{ color: '#888', fontSize: '13px' }}>Your Prakriti Analysis</div>
                    </div>
                </div>
                
                {/* Diet List Mock */}
                {[
                    { title: 'Morning Herb Tea', time: '07:00 AM', icon: <Leaf size={16} color={colors.primary}/> },
                    { title: 'Sattvic Breakfast', time: '08:30 AM', icon: <Apple size={16} color="#FF9800"/> },
                    { title: 'Yoga & Meditation', time: '06:00 PM', icon: <Heart size={16} color="#E91E63"/> }
                ].map((item, idx) => (
                    <div key={idx} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '15px',
                        backgroundColor: '#FAFAFA',
                        borderRadius: '12px',
                        marginBottom: '10px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                {item.icon}
                            </div>
                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.title}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#999', fontWeight: 'bold' }}>{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
      </header>

      {/* --- FEATURES SECTION --- */}
      <section style={{ backgroundColor: colors.accent, padding: '80px 0' }}>
        <div className="ac_container">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2 style={{ fontFamily: fonts.heading, fontSize: '36px', marginBottom: '15px' }}>Holistic Health Management</h2>
                <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto' }}>We combine the 5000-year-old science of Ayurveda with modern nutritional tracking to help you achieve balance.</p>
            </div>

            <div className="ac_grid_3">
                {[
                    { icon: <Activity size={32} color={colors.primary} />, title: 'Prakriti Analysis', desc: 'Detailed questionnaire to determine your body type (Vata, Pitta, Kapha).' },
                    { icon: <Apple size={32} color={colors.primary} />, title: 'Sattvic Diet Plans', desc: 'Personalized meal recommendations that balance your specific Doshas.' },
                    { icon: <Smartphone size={32} color={colors.primary} />, title: 'Smart Tracking', desc: 'Log your meals and get instant feedback on their ayurvedic compatibility.' },
                ].map((feature, idx) => (
                    <div key={idx} className="ac_btn" style={{
                        backgroundColor: 'white',
                        padding: '40px 30px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ marginBottom: '20px', display: 'inline-flex', padding: '15px', backgroundColor: colors.lightGreen, borderRadius: '50%' }}>
                            {feature.icon}
                        </div>
                        <h3 style={{ fontFamily: fonts.heading, fontSize: '22px', marginBottom: '15px' }}>{feature.title}</h3>
                        <p style={{ color: '#666', lineHeight: '1.6' }}>{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- APP DOWNLOAD SECTION --- */}
      <section className="ac_container ac_app_section" style={{ padding: '100px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '60px' }}>
        <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: '42px', marginBottom: '20px', lineHeight: '1.2' }}>
                Your Ayurvedic Doctor<br/>
                <span style={{ color: colors.secondary }}>Now in your Pocket.</span>
            </h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
                Download the AyurCare mobile app to access your diet charts offline, set yoga reminders, and consult with certified Ayurvedic doctors instantly.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* App Store Button Style Mock */}
                <button className="ac_btn" style={{
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left'
                }}>
                    <div style={{ fontSize: '28px' }}></div>
                    <div>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase' }}>Download on the</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>App Store</div>
                    </div>
                </button>

                {/* Play Store Button Style Mock */}
                <button className="ac_btn" style={{
                    backgroundColor: '#1a1a1a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left'
                }}>
                     <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.3,13.1L18.06,16.37L15.39,13.7L20.3,8.9C20.68,9.11 21,9.72 20.3,13.1M16.81,8.88L14.54,11.15L6.05,2.66L16.81,8.88Z" />
                    </svg>
                    <div>
                        <div style={{ fontSize: '10px', textTransform: 'uppercase' }}>Get it on</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Google Play</div>
                    </div>
                </button>
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '20px', fontSize: '14px', color: '#666', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={16} color={colors.primary} /> 4.9 Star Rating</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle size={16} color={colors.primary} /> 50k+ Downloads</div>
            </div>
        </div>

        {/* Phone Mockup */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div style={{
                width: '300px',
                height: '600px',
                backgroundColor: '#1a1a1a',
                borderRadius: '40px',
                border: '8px solid #333',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
            }}>
                {/* Notch */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '25px',
                    backgroundColor: '#333',
                    borderBottomLeftRadius: '12px',
                    borderBottomRightRadius: '12px',
                    zIndex: 20
                }}></div>

                {/* Screen Content */}
                <div style={{ height: '100%', backgroundColor: '#F9F9F9', paddingTop: '40px', paddingLeft: '20px', paddingRight: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontSize: '12px', color: '#888' }}>Good Morning,</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: fonts.heading }}>Rahul</div>
                        </div>
                        <div style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#ddd' }}></div>
                    </div>

                    <div style={{ backgroundColor: colors.primary, color: 'white', padding: '20px', borderRadius: '20px', marginBottom: '20px' }}>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>Daily Calorie Goal</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '5px 0' }}>1,250 <span style={{ fontSize: '14px', fontWeight: 'normal' }}>kcal</span></div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '10px', marginTop: '10px' }}>
                            <div style={{ width: '60%', height: '100%', backgroundColor: 'white', borderRadius: '10px' }}></div>
                        </div>
                    </div>

                    <div style={{ fontWeight: 'bold', marginBottom: '15px' }}>Today's Plan</div>
                    
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '15px', marginBottom: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                         <div style={{ width: '50px', height: '50px', backgroundColor: '#FFE082', borderRadius: '10px' }}></div>
                         <div>
                             <div style={{ fontWeight: 'bold' }}>Khichdi</div>
                             <div style={{ fontSize: '12px', color: '#888' }}>350 kcal • Pitta Balancing</div>
                         </div>
                    </div>
                     <div style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', backgroundColor: 'white', borderRadius: '15px', marginBottom: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                         <div style={{ width: '50px', height: '50px', backgroundColor: '#A5D6A7', borderRadius: '10px' }}></div>
                         <div>
                             <div style={{ fontWeight: 'bold' }}>Green Salad</div>
                             <div style={{ fontSize: '12px', color: '#888' }}>120 kcal • Tridoshic</div>
                         </div>
                    </div>

                    {/* Floating Action Button */}
                    <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '50px', height: '50px', backgroundColor: colors.secondary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                        <Leaf size={24} />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer style={{ backgroundColor: '#263238', color: 'white', padding: '60px 0 20px 0' }}>
        <div className="ac_container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', fontSize: '24px', color: colors.primary, fontFamily: fonts.heading, marginBottom: '20px' }}>
                    <Leaf size={24} />
                    <span>AyurCare</span>
                </div>
                <p style={{ color: '#B0BEC5', lineHeight: '1.6' }}>
                    Bringing balance to your life through the ancient science of Ayurveda.
                </p>
            </div>
            
            <div>
                <h4 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>Product</h4>
                <ul style={{ listStyle: 'none', padding: 0, color: '#B0BEC5', lineHeight: '2' }}>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a></li>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Dosha Test</a></li>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Doctors</a></li>
                </ul>
            </div>

             <div>
                <h4 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>Company</h4>
                <ul style={{ listStyle: 'none', padding: 0, color: '#B0BEC5', lineHeight: '2' }}>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</a></li>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a></li>
                    <li><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a></li>
                </ul>
            </div>

            <div>
                 <h4 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 'bold' }}>Get the App</h4>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <button style={{ background: 'none', border: '1px solid #546E7A', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>App Store</button>
                     <button style={{ background: 'none', border: '1px solid #546E7A', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Google Play</button>
                 </div>
            </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid #37474F', paddingTop: '20px', color: '#546E7A', fontSize: '14px' }}>
            © {new Date().getFullYear()} AyurCare Systems. All rights reserved.
        </div>
      </footer>
    </div>
  );
}