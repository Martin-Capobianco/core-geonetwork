/*
 * Copyright (C) 2001-2016 Food and Agriculture Organization of the
 * United Nations (FAO-UN), United Nations World Food Programme (WFP)
 * and United Nations Environment Programme (UNEP)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301, USA
 *
 * Contact: Jeroen Ticheler - FAO - Viale delle Terme di Caracalla 2,
 * Rome - Italy. email: geonetwork@osgeo.org
 */

(function() {

  goog.provide('gn_search_default_config');

  var module = angular.module('gn_search_default_config', []);

  module.value('gnTplResultlistLinksbtn',
      '../../catalog/views/default/directives/partials/linksbtn.html');

  module
      .run([
        'gnSearchSettings',
        'gnViewerSettings',
        'gnOwsContextService',
        'gnMap',
        'gnMapsManager',
        'gnDefaultGazetteer',
        function(searchSettings, viewerSettings, gnOwsContextService,
                 gnMap, gnMapsManager, gnDefaultGazetteer) {

          if(viewerSettings.mapConfig.viewerMapLayers) {
            console.warn('[geonetwork] Use of "mapConfig.viewerMapLayers" is deprecated. ' +
              'Please configure layer per map type.')
          }

          // Keep one layer in the background
          // while the context is not yet loaded.
          viewerSettings.bgLayers = [
            gnMap.createLayerForType('osm')
          ];
          viewerSettings.servicesUrl =
            viewerSettings.mapConfig.listOfServices || {};

          // WMS settings
          // If 3D mode is activated, single tile WMS mode is
          // not supported by olcesium, so force tiling.
          if (viewerSettings.mapConfig.is3DModeAllowed) {
            viewerSettings.singleTileWMS = false;
            // Configure Cesium to use a proxy. This is required when
            // WMS does not have CORS headers. BTW, proxy will slow
            // down rendering.
            viewerSettings.cesiumProxy = true;
          } else {
            viewerSettings.singleTileWMS = true;
          }

          var bboxStyle = new ol.style.Style({
            stroke: new ol.style.Stroke({
              color: 'rgba(255,0,0,1)',
              width: 2
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255,0,0,0.3)'
            })
          });
          searchSettings.olStyles = {
            drawBbox: bboxStyle,
            mdExtent: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 2
              })
            }),
            mdExtentHighlight: new ol.style.Style({
              stroke: new ol.style.Stroke({
                color: 'orange',
                width: 3
              }),
              fill: new ol.style.Fill({
                color: 'rgba(255,255,0,0.3)'
              })
            })

          };

          gnMapsManager.initProjections(viewerSettings.mapConfig.switcherProjectionList);
          var searchMap = gnMapsManager.createMap(gnMapsManager.SEARCH_MAP);
          var viewerMap = gnMapsManager.createMap(gnMapsManager.VIEWER_MAP);

          // To configure a gazetteer provider
          viewerSettings.gazetteerProvider = gnDefaultGazetteer;

          // Map protocols used to load layers/services in the map viewer
          searchSettings.mapProtocols = {
            layers: [
              'OGC:WMS',
              'OGC:WMTS',
              'OGC:WMS-1.1.1-http-get-map',
              'OGC:WMS-1.3.0-http-get-map',
              'OGC:WFS',
              'ESRI:REST'
              ],
            services: [
              'OGC:WMS-1.3.0-http-get-capabilities',
              'OGC:WMS-1.1.1-http-get-capabilities',
              'OGC:WMTS-1.0.0-http-get-capabilities',
              'OGC:WFS-1.0.0-http-get-capabilities'
              ]
          };

          var mapsConfig = {
    		  center: [14988995.498610, -2856910.369187],
              zoom: 2.5
            //maxResolution: 9783.93962050256
          };

          var viewerMap = new ol.Map({
            controls: [],
            view: new ol.View(mapsConfig)
          });

          var searchMap = new ol.Map({
            controls:[],
            layers: [new ol.layer.Tile({
              source: new ol.source.OSM()
            })],
            view: new ol.View(angular.extend({}, mapsConfig))
          });

        var recordMap = new ol.Map({
          view: new ol.View({
            center: [14988995.498610, -2856910.369187],
            zoom: 5
          })
        });
        /** Facets configuration */
          searchSettings.facetsSummaryType = 'details';

          /*
             * Hits per page combo values configuration. The first one is the
             * default.
             */
          searchSettings.hitsperpageValues = [20, 50, 100];

          /* Pagination configuration */
          searchSettings.paginationInfo = {
            hitsPerPage: searchSettings.hitsperpageValues[0]
          };

          /*
             * Sort by combo values configuration. The first one is the default.
             */
          searchSettings.sortbyValues = [{
              sortBy: 'relevance',
              sortOrder: ''
            },{
  	        sortBy: 'publicationDateDesc',
  	        sortOrder: ''
            },{
              sortBy: 'changeDate',
              sortOrder: ''
            }, {
  	        sortBy: 'eCatId',
  	        sortOrder: ''
            }, {
  	        sortBy: 'titleAZ',
  	        sortOrder: 'reverse'
            }/*, {
              sortBy: 'denominatorDesc',
              sortOrder: ''
            }, {
              sortBy: 'denominatorAsc',
              sortOrder: 'reverse'
            }*/];

          /* Default search by option */
          searchSettings.sortbyDefault = searchSettings.sortbyValues[0];

          /* Custom templates for search result views */
          searchSettings.resultViewTpls = [{
                  tplUrl: '../../catalog/components/search/resultsview/' +
                  'partials/viewtemplates/list.html',
                  tooltip: 'List',
                  icon: 'fa-th-list'
                },
                {
                  tplUrl: '../../catalog/components/search/resultsview/' +
                  'partials/viewtemplates/titlewithselection.html',
                  tooltip: 'Title',
                  icon: 'fa-list'
                }];

          // For the time being metadata rendering is done
          // using Angular template. Formatter could be used
          // to render other layout

          // TODO: formatter should be defined per schema
          // schema: {
          // iso19139: 'md.format.xml?xsl=full_view&&id='
          // }
          searchSettings.formatter = {
            // defaultUrl: 'md.format.xml?xsl=full_view&id='
            // defaultUrl: 'md.format.xml?xsl=xsl-view&uuid=',
            // defaultPdfUrl: 'md.format.pdf?xsl=full_view&uuid=',
            list: [{
              label: 'full',
              url : function(md) {
                return '../api/records/' + md.getUuid() + '/formatters/xsl-view?root=div&view=advanced';
              }
            }]
          };

          // Mapping for md links in search result list.
          searchSettings.linkTypes = {
            links: ['LINK', 'kml'],
            downloads: ['DOWNLOAD'],
            //layers:['OGC', 'kml'],
            layers:['OGC'],
            maps: ['ows']
          };

          // Set the default template to use
          searchSettings.resultTemplate =
              searchSettings.resultViewTpls[0].tplUrl;
          // Set custom config in gnSearchSettings
          angular.extend(searchSettings, {
            viewerMap: viewerMap,
            searchMap: searchMap,
            recordMap: recordMap
          });

        }]);
})();
