FROM php:8.2-apache

# Instalar mysqli
RUN docker-php-ext-install mysqli

# Activar mod_rewrite
RUN a2enmod rewrite

# Copiar proyecto
COPY . /var/www/html/

# Cambiar carpeta raíz de Apache
RUN sed -i 's!/var/www/html!/var/www/html/pescadirecta!g' /etc/apache2/sites-available/000-default.conf

# Permisos
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
