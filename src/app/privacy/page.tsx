export const metadata = {
  title: "Política de Privacidad | SemiEdu",
  description:
    "Conoce cómo SemiEdu recopila, utiliza y protege tus datos al integrar Google Classroom y ofrecer servicios educativos personalizados.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Política de Privacidad
        </h1>

        <div className="space-y-6 text-gray-700">
          {/* 1. Introducción */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              1. Introducción
            </h2>
            <p>
              SemiEdu es responsable del manejo, recopilación y protección de los datos
              personales que se obtienen al usar nuestra plataforma. Todas las menciones a
              SemiEdu en este documento se refieren a la empresa, el equipo de desarrollo y
              la operación general del servicio.

            </p>
          </section>

          {/* 2. Datos que recopilamos */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              2. Información que Recopilamos
            </h2>
            <p className="mb-3">
              Recopilamos los siguientes tipos de información:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Datos de Autenticación:</strong> Información de tu cuenta de
                Google (nombre, correo, foto de perfil).
              </li>
              <li>
                <strong>Datos de Google Classroom:</strong> Cursos, tareas,
                calificaciones y otra información relacionada con el entorno
                académico.
              </li>
              <li>
                <strong>Datos de Uso:</strong> Actividades realizadas dentro de la
                plataforma y navegación.
              </li>
              <li>
                <strong>Información Técnica:</strong> Dirección IP, tipo de
                navegador, sistema operativo y dispositivo.
              </li>
            </ul>
          </section>

          {/* 3. Uso */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Uso de la Información
            </h2>
            <p className="mb-3">Utilizamos tus datos personales para:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Proporcionar y mejorar las funcionalidades del sistema</li>
              <li>Autenticar usuarios y proteger la seguridad de la cuenta</li>
              <li>Mostrar cursos, tareas y estadísticas personalizadas</li>
              <li>Ofrecer soporte técnico</li>
              <li>Cumplir obligaciones legales</li>
            </ul>
          </section>

          {/* 4. Seguridad */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              4. Seguridad de Datos
            </h2>
            <p>
              Implementamos medidas de seguridad para proteger tus datos personales
              contra accesos o usos no autorizados. Aunque aplicamos buenas
              prácticas, ningún sistema es completamente infalible.
            </p>
          </section>

          {/* 5. Compartir */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              5. Compartir Información
            </h2>
            <p className="mb-3">
              No compartimos tu información personal con terceros excepto cuando:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Sea necesario para operar y mantener la plataforma</li>
              <li>Sea requerido por ley o autoridades competentes</li>
              <li>Autorices explícitamente dicho uso</li>
            </ul>
          </section>

          {/* 6. Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              6. Cookies
            </h2>
            <p>
              Utilizamos cookies para mejorar tu experiencia, recordar tus
              preferencias y analizar el uso general de la plataforma. Puedes
              deshabilitarlas desde tu navegador, aunque algunas funciones podrían
              verse afectadas.
            </p>
          </section>

          {/* 7. Retención */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              7. Retención de Datos
            </h2>
            <p>
              Conservamos tus datos únicamente mientras sea necesario para
              brindarte nuestros servicios o según lo exija la ley. Puedes solicitar
              la eliminación de tus datos cuando lo desees.
            </p>
          </section>

          {/* 8. Derechos */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              8. Derechos del Usuario
            </h2>
            <p className="mb-3">Puedes ejercer los siguientes derechos:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Acceder a tus datos personales</li>
              <li>Solicitar correcciones</li>
              <li>Solicitar eliminación de datos</li>
              <li>Revocar permisos otorgados</li>
              <li>Solicitar copia de tus datos (portabilidad)</li>
            </ul>
          </section>

          {/* 9. Cambios */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              9. Cambios en esta Política
            </h2>
            <p>
              Podemos actualizar esta Política cuando sea necesario. Notificaremos
              cambios importantes mediante correo o avisos dentro de la plataforma.
            </p>
          </section>

          {/* 10. Contacto */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              10. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre esta Política o deseas ejercer tus derechos,
              contáctanos en:
            </p>
            <p className="mt-3 text-gray-600">
              Email: armandoanchundiayela@gmail.com
              <br />
              Ecuador
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>
              Última actualización:{" "}
              {new Date().toLocaleDateString("es-ES")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
