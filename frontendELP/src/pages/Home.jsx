import React from 'react';
import { ArrowRight, Users, FileText, Clock, BarChart3, Shield, Award } from 'lucide-react';
import { Button, Card, CardGrid } from '../components/ui';

/**
 * Página Home del Sistema ELP Pontificia
 * Página de bienvenida con información general del sistema
 */
const Home = () => {
  const features = [
    {
      icon: Users,
      title: 'Gestión de Personal',
      description: 'Administra información completa del personal docente y administrativo',
      color: 'text-blue-600'
    },
    {
      icon: FileText,
      title: 'Documentos Digitales',
      description: 'Sistema centralizado de gestión documental con firma digital',
      color: 'text-green-600'
    },
    {
      icon: Clock,
      title: 'Control de Horas',
      description: 'Registro y seguimiento de horas trabajadas con reportes automáticos',
      color: 'text-orange-600'
    },
    {
      icon: BarChart3,
      title: 'Reportes y Analytics',
      description: 'Dashboards interactivos con métricas y KPIs en tiempo real',
      color: 'text-purple-600'
    },
    {
      icon: Shield,
      title: 'Seguridad Avanzada',
      description: 'Autenticación robusta y control de acceso por roles',
      color: 'text-red-600'
    },
    {
      icon: Award,
      title: 'Excelencia Académica',
      description: 'Herramientas diseñadas para la excelencia educativa pontificia',
      color: 'text-yellow-600'
    }
  ];

  const stats = [
    { number: '500+', label: 'Usuarios Activos', color: 'text-blue-600' },
    { number: '10K+', label: 'Documentos Gestionados', color: 'text-green-600' },
    { number: '24/7', label: 'Disponibilidad', color: 'text-orange-600' },
    { number: '99.9%', label: 'Uptime', color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-accent-400 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-primary-800">ELP</span>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              Sistema ELP
              <span className="block text-accent-400">Pontificia Universidad</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Plataforma integral de gestión académica y administrativa diseñada 
              para la excelencia educativa pontificia
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-accent-400 text-primary-800 hover:bg-accent-300 font-semibold"
              >
                Acceder al Sistema
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                className="text-white border-white hover:bg-white hover:text-primary-800"
              >
                Conocer Más
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl sm:text-4xl font-bold ${stat.color} mb-2`}>
                  {stat.number}
                </div>
                <div className="text-text-secondary font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Un sistema completo diseñado para optimizar la gestión académica y administrativa
            </p>
          </div>

          <CardGrid cols={3} gap="lg">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index}
                  hover
                  className="text-center h-full"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center ${feature.color}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </CardGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-200 mb-8">
            Únete a la comunidad educativa pontificia y descubre todas las herramientas 
            que tenemos para optimizar tu trabajo diario
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-accent-400 text-primary-800 hover:bg-accent-300"
            >
              Iniciar Sesión
            </Button>
            <Button 
              variant="secondary"
              size="lg"
              className="text-white border-white hover:bg-white hover:text-primary-800"
            >
              Solicitar Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;