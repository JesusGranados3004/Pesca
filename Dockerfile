FROM php:8.2-apache

# Instalar mysqli
RUN docker-php-ext-install mysqli

# Activar rewrite
RUN a2enmod rewrite

# Copiar archivos
COPY . /var/www/html/

# Cambiar raíz pública hacia tu carpeta
RUN sed -i 's!/var/www/html!/var/www/html/WIREFRAME BLUEMARKET!g' /etc/apache2/sites-available/000-default.conf

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
