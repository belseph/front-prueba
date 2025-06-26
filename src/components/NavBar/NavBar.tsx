import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { Lightbulb, Home, BarChart3, MessageCircle, Bell, Menu, X } from 'lucide-react';
import { getUserAvatar } from '../Post/utils/avatarUtils';
import './NavBar.css';

interface NavLink {
    label: string;
    url: string;
    onClick?: () => void;
}

interface Props {
    userIcon: string;
    links: NavLink[];
}

const NavBar: React.FC<Props> = ({ userIcon, links }) => {
    const { isLoggedIn, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notificationCount] = useState(3); // Por ahora hardcodeado
    const menuRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const userAvatar = user?.userId ? getUserAvatar(user.userId) : userIcon;
    
    const handleToggle = () => {
        setIsMenuOpen(prev => !prev);
    };

    const handleMobileMenuToggle = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    const handleNotificationClick = () => {
        // Falta implementar funcionalidad
    };

    const handleMessagesClick = () => {
        // Falta implementar funcionalidad
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
        setIsMobileMenuOpen(false);
    }, [location]);

    // Cerrar menú móvil cuando se cambie a desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <>
            <nav className="navbar">
                {/* Logo y título */}
                <Link to={isLoggedIn ? "/home" : "/"}>
                    <section className="navbar-wrapper">
                        <div className="navbar-logo__container">
                            <Lightbulb />
                        </div>
                        <div className='navbar-title__container'>
                            <h1 className="navbar-title">SkillLink</h1>
                            <h2 className="navbar-subtitle">Emprendedor</h2>
                        </div>
                    </section>
                </Link>

                {/* Navegación principal (solo si está logueado) */}
                {isLoggedIn && (
                    <>
                        {/* Navegación desktop */}
                        <div className="navbar-nav">
                            <Link 
                                to="/home" 
                                className={location.pathname === '/home' ? 'active' : ''}
                            >
                                <Home className="w-4 h-4 inline mr-2" />
                                Inicio
                            </Link>
                            
                            <Link 
                                to="/dashboard" 
                                className={location.pathname === '/dashboard' ? 'active' : ''}
                            >
                                <BarChart3 className="w-4 h-4 inline mr-2" />
                                Dashboard
                            </Link>
                            
                            <button 
                                onClick={handleMessagesClick}
                                className="flex items-center text-white hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-200"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Mensajes
                            </button>
                        </div>

                        {/* Menú de usuario y notificaciones */}
                        <div className="menu">
                            {/* Botón hamburguesa para móvil */}
                            <button 
                                className="mobile-menu-button"
                                onClick={handleMobileMenuToggle}
                            >
                                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>

                            {/* Notificaciones (visible en desktop) */}
                            <button 
                                className="notification-button desktop-only"
                                onClick={handleNotificationClick}
                            >
                                <Bell className="w-5 h-5" />
                                {notificationCount > 0 && (
                                    <span className="notification-badge">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </button>

                            {/* Avatar del usuario (visible en desktop) */}
                            <div className="desktop-only" ref={menuRef}>
                                <button className="dropdown-toggle" onClick={handleToggle}>
                                    <img src={userAvatar} alt="Imagen de usuario" className="dropdown-toggle-icon" />
                                </button>

                                {/* Menú desplegable desktop */}
                                {isMenuOpen && (
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link to="/#">
                                                Perfil
                                            </Link>
                                        </li>
                                        {links.map((link, index) => (
                                            link.label === 'Cerrar Sesión' && (
                                                <li key={index}>
                                                    <a href={link.url} onClick={link.onClick}>
                                                        {link.label}
                                                    </a>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </nav>

            {/* Menú móvil overlay */}
            {isLoggedIn && isMobileMenuOpen && (
                <div className="mobile-menu-overlay" ref={mobileMenuRef}>
                    <div className="mobile-menu-content">
                        {/* Header del menú móvil */}
                        <div className="mobile-menu-header">
                            <div className="mobile-user-info">
                                <img src={userAvatar} alt="Imagen de usuario" className="mobile-user-avatar" />
                                <div className="mobile-user-details">
                                    <h3 className="mobile-user-name">{user?.name || 'Usuario'}</h3>
                                    <p className="mobile-user-email">{user?.email || 'usuario@email.com'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navegación móvil */}
                        <div className="mobile-menu-nav">
                            <Link 
                                to="/home" 
                                className={`mobile-nav-link ${location.pathname === '/home' ? 'active' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Home className="w-5 h-5" />
                                <span>Inicio</span>
                            </Link>
                            
                            <Link 
                                to="/dashboard" 
                                className={`mobile-nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <BarChart3 className="w-5 h-5" />
                                <span>Dashboard</span>
                            </Link>
                            
                            <button 
                                onClick={() => {
                                    handleMessagesClick();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="mobile-nav-link"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>Mensajes</span>
                            </button>

                            <button 
                                onClick={() => {
                                    handleNotificationClick();
                                    setIsMobileMenuOpen(false);
                                }}
                                className="mobile-nav-link"
                            >
                                <Bell className="w-5 h-5" />
                                <span>Notificaciones</span>
                                {notificationCount > 0 && (
                                    <span className="mobile-notification-badge">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Footer del menú móvil */}
                        <div className="mobile-menu-footer">
                            <Link 
                                to="/#" 
                                className="mobile-footer-link"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Perfil
                            </Link>
                            {links.map((link, index) => (
                                link.label === 'Cerrar Sesión' && (
                                    <button 
                                        key={index}
                                        onClick={() => {
                                            link.onClick?.();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="mobile-footer-link logout-button"
                                    >
                                        {link.label}
                                    </button>
                                )
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavBar;