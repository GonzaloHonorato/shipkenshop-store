#set( $symbol_pound = '#' )
#set( $symbol_dollar = '$' )
#set( $symbol_escape = '\' )
package ${package}.pattern;

import ${package}.model.Libro;

/**
 * Patron de Diseño: Builder
 * Permite construir objetos Libro paso a paso, estableciendo
 * cada atributo de forma encadenada antes de invocar build().
 * Es util cuando se necesita crear libros con distintas
 * combinaciones de campos opcionales sin usar constructores largos.
 */
public class LibroBuilder {

    private String titulo;
    private String autor;
    private Integer anioPublicacion;
    private String genero;

    public LibroBuilder titulo(String titulo) {
        this.titulo = titulo;
        return this;
    }

    public LibroBuilder autor(String autor) {
        this.autor = autor;
        return this;
    }

    public LibroBuilder anioPublicacion(Integer anioPublicacion) {
        this.anioPublicacion = anioPublicacion;
        return this;
    }

    public LibroBuilder genero(String genero) {
        this.genero = genero;
        return this;
    }

    public Libro build() {
        Libro libro = new Libro();
        libro.setTitulo(this.titulo);
        libro.setAutor(this.autor);
        libro.setAnioPublicacion(this.anioPublicacion);
        libro.setGenero(this.genero);
        return libro;
    }
}
