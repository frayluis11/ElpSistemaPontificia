import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X,
  Camera,
  Shield,
  Settings,
  Bell,
  Eye
} from 'lucide-react';
import { Card, CardGrid, Button, Input } from '../components/ui';

/**
 * Página de Perfil de Usuario del Sistema ELP Pontificia
 * Gestión de información personal y configuraciones
 */
const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  
  const [userInfo, setUserInfo] = useState({
    firstName: 'Juan Carlos',
    lastName: 'Pérez García',
    email: 'juan.perez@pontificia.edu',
    phone: '+1 (555) 123-4567',
    position: 'Docente Senior',
    department: 'Facultad de Ingeniería',
    location: 'Campus Principal',
    joinDate: '2020-03-15',
    employeeId: 'EMP-2020-456',
    bio: 'Docente especializado en Sistemas de Información con más de 10 años de experiencia en educación superior.'
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReports: true,
    systemUpdates: true,
    language: 'es',
    timezone: 'America/Bogota'
  });

  const tabs = [
    { id: 'personal', label: 'Información Personal', icon: User },
    { id: 'settings', label: 'Configuraciones', icon: Settings },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'notifications', label: 'Notificaciones', icon: Bell }
  ];

  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios
    console.log('Saving user info:', userInfo);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Revertir cambios
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Mi Perfil
          </h1>
          <p className="text-text-secondary mt-1">
            Gestiona tu información personal y configuraciones del sistema
          </p>
        </div>
        
        {activeTab === 'personal' && (
          <div className="flex items-center space-x-3">
            {isEditing ? (
              <>
                <Button variant="secondary" onClick={handleCancel} icon={X} size="sm">
                  Cancelar
                </Button>
                <Button onClick={handleSave} icon={Save} size="sm">
                  Guardar
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} icon={Edit} size="sm">
                Editar Perfil
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-secondary-500 text-secondary-600'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido de los tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información Personal */}
        {activeTab === 'personal' && (
          <>
            {/* Columna izquierda - Avatar y resumen */}
            <div className="lg:col-span-1">
              <Card>
                <div className="text-center">
                  {/* Avatar */}
                  <div className="relative inline-block">
                    <div className="w-32 h-32 bg-accent-400 rounded-full flex items-center justify-center text-4xl font-bold text-primary-800 mx-auto mb-4">
                      {userInfo.firstName[0]}{userInfo.lastName[0]}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-2 right-2 w-8 h-8 bg-secondary-500 text-white rounded-full flex items-center justify-center hover:bg-secondary-600 transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-text-primary mb-2">
                    {userInfo.firstName} {userInfo.lastName}
                  </h2>
                  <p className="text-text-secondary mb-1">{userInfo.position}</p>
                  <p className="text-sm text-text-secondary mb-4">{userInfo.department}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-center space-x-2 text-text-secondary">
                      <Mail className="w-4 h-4" />
                      <span>{userInfo.email}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-text-secondary">
                      <MapPin className="w-4 h-4" />
                      <span>{userInfo.location}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-text-secondary">
                      <Calendar className="w-4 h-4" />
                      <span>Desde {new Date(userInfo.joinDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Columna derecha - Formulario */}
            <div className="lg:col-span-2">
              <Card title="Información Personal" subtitle="Gestiona tus datos personales">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre"
                    value={userInfo.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Apellido"
                    value={userInfo.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    leftIcon={Mail}
                  />
                  <Input
                    label="Teléfono"
                    value={userInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    leftIcon={Phone}
                  />
                  <Input
                    label="Cargo"
                    value={userInfo.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="Departamento"
                    value={userInfo.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={!isEditing}
                  />
                  <Input
                    label="ID de Empleado"
                    value={userInfo.employeeId}
                    disabled
                  />
                  <Input
                    label="Ubicación"
                    value={userInfo.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!isEditing}
                    leftIcon={MapPin}
                  />
                </div>
                
                <div className="mt-6">
                  <label className="block text-body font-medium text-text-primary mb-2">
                    Biografía
                  </label>
                  <textarea
                    value={userInfo.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500 transition-colors duration-200 disabled:bg-gray-50"
                  />
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Configuraciones */}
        {activeTab === 'settings' && (
          <div className="lg:col-span-3">
            <CardGrid cols={2} gap="lg">
              <Card title="Preferencias Generales">
                <div className="space-y-4">
                  <div>
                    <label className="block text-body font-medium text-text-primary mb-2">
                      Idioma
                    </label>
                    <select 
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-body font-medium text-text-primary mb-2">
                      Zona Horaria
                    </label>
                    <select 
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500"
                    >
                      <option value="America/Bogota">America/Bogotá</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/Madrid">Europe/Madrid</option>
                    </select>
                  </div>
                </div>
              </Card>

              <Card title="Notificaciones">
                <div className="space-y-4">
                  {Object.entries({
                    emailNotifications: 'Notificaciones por Email',
                    pushNotifications: 'Notificaciones Push',
                    weeklyReports: 'Reportes Semanales',
                    systemUpdates: 'Actualizaciones del Sistema'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-body text-text-primary">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings[key]}
                          onChange={(e) => handleSettingChange(key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </Card>
            </CardGrid>
          </div>
        )}

        {/* Seguridad */}
        {activeTab === 'security' && (
          <div className="lg:col-span-3">
            <CardGrid cols={2} gap="lg">
              <Card title="Cambiar Contraseña">
                <div className="space-y-4">
                  <Input
                    type="password"
                    label="Contraseña Actual"
                    placeholder="Ingresa tu contraseña actual"
                  />
                  <Input
                    type="password"
                    label="Nueva Contraseña"
                    placeholder="Ingresa tu nueva contraseña"
                  />
                  <Input
                    type="password"
                    label="Confirmar Contraseña"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <Button fullWidth>
                    Actualizar Contraseña
                  </Button>
                </div>
              </Card>

              <Card title="Sesiones Activas">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">Esta sesión</p>
                      <p className="text-sm text-text-secondary">Windows • Chrome</p>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Activa</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-text-primary">iPhone</p>
                      <p className="text-sm text-text-secondary">iOS • Safari</p>
                    </div>
                    <Button variant="secondary" size="sm">Cerrar</Button>
                  </div>
                </div>
              </Card>
            </CardGrid>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;