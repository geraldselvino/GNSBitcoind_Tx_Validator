#######################################################
# Copyright (c) 2018, Gerald Selvino 
# <gerald.selvino@protonmail.com> All rights reserved.
#
# The docker config file for
#######################################################

FROM node:8.11.1
WORKDIR /GNSBitcoindTxValidator
COPY package*.json /GNSBitcoindTxValidator/
RUN npm install
ADD . /GNSBitcoindTxValidator
