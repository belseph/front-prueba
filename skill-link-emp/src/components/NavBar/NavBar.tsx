import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { Lightbulb, Home, BarChart3, MessageCircle, Bell } from 'lucide-react';
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
    const [notificationCount] = useState(3); // Por ahora hardcodeado
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    const userAvatar = user?.userId ? getUserAvatar(user.userId) : userIcon;
    const handleToggle = () => {
        setIsMenuOpen(prev => !prev);
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
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    return (
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
                    <div className="menu" ref={menuRef}>
                        <button 
                            className="notification-button"
                            onClick={handleNotificationClick}
                        >
                            <Bell className="w-5 h-5" />
                            {notificationCount > 0 && (
                                <span className="notification-badge">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>

                        {/* Avatar del usuario */}
                        <button className="dropdown-toggle" onClick={handleToggle}>
                            <img src={userAvatar} alt="Imagen de usuario" className="dropdown-toggle-icon" />
                        </button>

                        {/* Menú desplegable */}
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
                </>
            )}
        </nav>
    );
};

export default NavBar;