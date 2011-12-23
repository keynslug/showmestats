#!/bin/bash
echo '[*] riak-browser v0.1 installer'
echo '[*] uses curl for uploading files'
#hostname
echo -n '[cfg] riak hostname (localhost):'
read riakhostname
if [ -z "$riakhostname" ]; then 
  riakhostname='localhost' 
fi
#port
echo -n '[cfg] riak port (8098):'
read riakport
if [ -z "$riakport" ]; then
  riakport='8098'
fi
#location
echo -n '[cfg] riak location (riak):'
read riaklocation
if [ -z "$riaklocation" ]; then 
  riaklocation='riak'
fi
#bucket
echo -n '[cfg] riak-browser bucket (riak-browser):'
read riaktargetbucket
if [ -z "$riaktargetbucket" ]; then 
  riaktargetbucket='client' 
fi
#index
index='index.html'

url="http://$riakhostname:$riakport/$riaklocation/$riaktargetbucket/"
echo "[*] installing files to $url"

files=`ls -1 .`

for file in ${files[@]}
 do
  echo "Uploading $file..."
  case $file in
    *.html )
      content_type="Content-Type: text/html"
      ;;
    *.js )
      content_type="Content-Type: text/javascript"
      ;;
    *.css )
      content_type="Content-Type: text/css"
      ;;
    *.png )
      content_type="Content-Type: image/png"
      ;;
  esac

  curl --silent -X PUT -H "${content_type}" --data-binary @$file "$url$file";

done

echo "[*] riak-browser installed, point your browser at:"
echo "[*] $url$index"
