# Copyright (c) 2026 Cyentific AS.
# All Rights Reserved.
#
# This file is part of the Cyentific CACAO Platform.
# Unauthorized copying, modification, distribution, or commercial use is prohibited.

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY src ./src

ENV PORT=3001
EXPOSE 3001

CMD ["npm", "start"]
