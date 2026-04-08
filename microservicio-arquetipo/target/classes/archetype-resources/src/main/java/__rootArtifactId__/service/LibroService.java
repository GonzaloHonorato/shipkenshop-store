#set( $symbol_pound = '#' )
#set( $symbol_dollar = '$' )
#set( $symbol_escape = '\' )
package ${package}.service;

import ${package}.model.Libro;
import ${package}.pattern.LibroBuilder;
import ${package}.repository.LibroRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LibroService {

    private final LibroRepository libroRepository;

    public LibroService(LibroRepository libroRepository) {
        this.libroRepository = libroRepository;
    }

    public List<Libro> obtenerTodos() {
        return libroRepository.findAll();
    }

    public Optional<Libro> obtenerPorId(Long id) {
        return libroRepository.findById(id);
    }

    /**
     * Usa el patron Builder para construir el objeto Libro
     * antes de persistirlo en la base de datos.
     */
    public Libro guardar(Libro libro) {
        Libro nuevoLibro = new LibroBuilder()
                .titulo(libro.getTitulo())
                .autor(libro.getAutor())
                .anioPublicacion(libro.getAnioPublicacion())
                .genero(libro.getGenero())
                .build();
        return libroRepository.save(nuevoLibro);
    }

    public Libro actualizar(Long id, Libro libroActualizado) {
        Libro libro = libroRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Libro no encontrado con id: " + id));
        libro.setTitulo(libroActualizado.getTitulo());
        libro.setAutor(libroActualizado.getAutor());
        libro.setAnioPublicacion(libroActualizado.getAnioPublicacion());
        libro.setGenero(libroActualizado.getGenero());
        return libroRepository.save(libro);
    }

    public void eliminar(Long id) {
        if (!libroRepository.existsById(id)) {
            throw new RuntimeException("Libro no encontrado con id: " + id);
        }
        libroRepository.deleteById(id);
    }
}
