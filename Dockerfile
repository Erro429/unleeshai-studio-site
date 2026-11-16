# Static site: no build step, nginx serves the files as they are in the repo.
# Port 3000 matches the "Exposed ports" value in Coolify; change both together.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
# .dockerignore keeps the generator tools, docs and raw generations out of the image
COPY . /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/nginx.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
