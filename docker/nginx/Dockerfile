# The instance's entry point: nginx with Simplist's routing built in, versioned with the release
# (no config file to download or keep up to date on the server)
FROM nginx:1.27-alpine

COPY docker/nginx/simplist.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
