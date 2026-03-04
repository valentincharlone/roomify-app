import { Box } from 'lucide-react'
import { Button } from './ui/Button'
import { useOutletContext } from 'react-router';

export default function NavBar() {
    const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>();

    const handleAuthClick = async () => {
        if (isSignedIn) {
            try {

                await signOut();
            } catch (error) {
                console.error(`Failed to sign out: ${error}`);
            }

            return;
        }
        try {
            await signIn();
        } catch (error) {
            console.error(`Failed to sign in: ${error}`);
        }
    }

    return (
        <header className="navbar">
            <nav className="inner">
                <div className="left">
                    <div className="brand">
                        <Box className="logo" />

                        <span className="name">
                            Roomify
                        </span>
                    </div>

                    <ul className="links">
                        <a href="#">Producto</a>
                        <a href="#">Precios</a>
                        <a href="#">Comunidad</a>
                        <a href="#">Empresas</a>
                    </ul>
                </div>

                <div className="actions">
                    {isSignedIn ? (
                        <>
                            <span className="greeting">
                                {userName ? `Hola, ${userName}` : 'Sesión iniciada'}
                            </span>

                            <Button size="sm" onClick={handleAuthClick} className="btn">
                                Cerrar sesión
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={handleAuthClick} size="sm" variant="secondary">
                                Iniciar sesión
                            </Button>

                            <a href="#upload" className="cta">Empezar ahora</a>
                        </>
                    )}
                </div>
            </nav>
        </header>
    )
}
