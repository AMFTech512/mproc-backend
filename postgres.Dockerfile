FROM postgres

# copy the init script into the image
COPY ./db /docker-entrypoint-initdb.d

USER postgres
ENTRYPOINT [ "docker-entrypoint.sh" ]
CMD [ "postgres" ]