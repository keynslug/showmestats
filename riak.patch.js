/**
   This file is provided to you under the Apache License,
   Version 2.0 (the "License"); you may not use this file
   except in compliance with the License.  You may obtain
   a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing,
   software distributed under the License is distributed on an
   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
   KIND, either express or implied.  See the License for the
   specific language governing permissions and limitations
   under the License.
**/

(function () {

    var isDefined = function (v) {
        return v !== null && v !== undefined;
    };
    
    var riakMapperConstructor = window.RiakMapper,
        riakMapperPrototype = window.RiakMapper.prototype;
    
    if (riakMapperConstructor) {
        
        RiakMapper = function (client, bucketName, index, key) {
            riakMapperConstructor.call(this, client, bucketName, key);
            this.secondaryIndex = index;
        };
        
        for (var i in riakMapperPrototype) {
            if (riakMapperPrototype.hasOwnProperty(i) && i !== 'constructor') {
                RiakMapper.prototype[i] = riakMapperPrototype[i];
            }
        }
        
        RiakMapper.prototype.request = function (timeout) {
            return {
                'inputs': this._buildInputs(),
                'query': this.phases,
                'timeout': timeout
            };
        };
        
        RiakMapper.prototype._buildInputs = function() {
            if (isDefined(this.secondaryIndex) && isDefined(this.key)) {
                return {bucket: this.bucket, index: this.secondaryIndex, key: this.key};
            }
            if (isDefined(this.key)) {
                return [[this.bucket, this.key]];
            }
            else {
                return this.bucket;
            }
        };

    };

    
})();
