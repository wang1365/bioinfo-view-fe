from nginx:1.22.0-alpine

COPY dist/spa /opt/frontend
COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx.conf /etc/nginx/nginx.conf

