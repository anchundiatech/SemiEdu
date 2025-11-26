export const metadata = {
  title: "Términos y Condiciones | SemiEdu",
  description:
    "Lee los Términos y Condiciones de SemiEdu, la plataforma que integra Google Classroom para brindar herramientas educativas avanzadas a estudiantes y docentes.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Términos y Condiciones
        </h1>

        <div className="space-y-6 text-gray-700">
          {/* 1. Aceptación */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              1. Aceptación de Términos
            </h2>
            <p>
              Al acceder y utilizar SemiEdu, aceptas cumplir con estos Términos
              y Condiciones. Si no estás de acuerdo con alguno de ellos, no
              debes utilizar la plataforma. Podremos actualizar estos términos en
              cualquier momento; la versión vigente será publicada en esta
              página.
            </p>
          </section>

          {/* 2. Servicio */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              2. Descripción del Servicio
            </h2>
            <p>
              SemiEdu es una plataforma que integra datos de Google Classroom para
              ofrecer herramientas educativas, estadísticas, reportes y gestión
              académica. El servicio depende parcialmente de APIs externas de
              Google para su funcionamiento.
            </p>
          </section>

          {/* 3. Elegibilidad */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              3. Elegibilidad del Usuario
            </h2>
            <p className="mb-3">
              Para utilizar SemiEdu, aceptas que cumples con lo siguiente:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Tener al menos 13 años de edad</li>
              <li>
                Si eres menor de edad, contar con autorización de tu padre,
                madre o tutor
              </li>
              <li>
                Tener una cuenta válida de Google que permita acceso a Google
                Classroom
              </li>
              <li>Usar el servicio únicamente para fines educativos y legales</li>
            </ul>
          </section>

          {/* 4. Cuenta */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              4. Cuenta de Usuario
            </h2>
            <p className="mb-3">
              Eres responsable de las actividades realizadas en tu cuenta, así
              como de mantener tus credenciales seguras. Notifícanos si detectas
              acceso no autorizado.
            </p>
          </section>

          {/* 5. Contenido */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              5. Contenido del Usuario
            </h2>
            <p className="mb-3">
              SemiEdu accede únicamente al contenido académico necesario para
              brindar sus funcionalidades. Al usar la plataforma, aceptas:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Respetar la propiedad intelectual de las instituciones</li>
              <li>No distribuir contenido académico sin permiso</li>
              <li>No divulgar datos personales de otros usuarios</li>
              <li>No utilizar la plataforma para actividades ilícitas</li>
            </ul>
          </section>

          {/* 6. Propiedad */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              6. Propiedad Intelectual
            </h2>
            <p>
              Todo el contenido generado por SemiEdu (software, diseño, imágenes,
              documentación, estadísticas) es propiedad de SemiEdu. El contenido
              proveniente de Google Classroom sigue siendo propiedad de Google y
              de las instituciones educativas correspondientes.
            </p>
          </section>

          {/* 7. Responsabilidad */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              7. Limitación de Responsabilidad
            </h2>
            <p className="mb-3">
              SemiEdu se proporciona &quot;tal cual&quot; sin garantías de
              funcionamiento continuo. No nos hacemos responsables de:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Pérdida de información académica</li>
              <li>Interrupciones en los servicios de Google</li>
              <li>
                Cambios en APIs externas que afecten temporalmente la
                plataforma
              </li>
              <li>Decisiones basadas en información generada por el sistema</li>
            </ul>
          </section>

          {/* 8. Google Classroom */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              8. Integración con Google Classroom
            </h2>
            <p className="mb-3">
              Para utilizar SemiEdu, aceptas que:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Nos autorizas a acceder solo a los datos necesarios de Google
                Classroom
              </li>
              <li>
                Cumplimos con los términos de servicio y políticas de Google
              </li>
              <li>Puedes revocar permisos en cualquier momento</li>
            </ul>
          </section>

          {/* 9. Prohibiciones */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              9. Prohibiciones
            </h2>
            <p className="mb-3">Queda estrictamente prohibido:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Intentar acceder a datos sin autorización</li>
              <li>Interferir con el funcionamiento de SemiEdu</li>
              <li>Uso malintencionado de los datos</li>
              <li>Reventa o redistribución del servicio</li>
            </ul>
          </section>

          {/* 10. Terminación */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              10. Terminación de la Cuenta
            </h2>
            <p>
              Podemos suspender o eliminar cuentas que violen estos términos.
              También puedes solicitar la eliminación definitiva de tus datos.
            </p>
          </section>

          {/* 11. Ley */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              11. Ley Aplicable
            </h2>
            <p>
              Estos términos se rigen por las leyes vigentes en Ecuador. Cualquier
              disputa será atendida bajo dicha jurisdicción.
            </p>
          </section>

          {/* 12. Contacto */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              12. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre estos términos, contáctanos:
            </p>
            <p className="mt-3 text-gray-600">
              Email: legal@semiedu.com
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
