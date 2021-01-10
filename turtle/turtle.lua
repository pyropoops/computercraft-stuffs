os.loadAPI("json")
local ws, err = http.websocket("ws://localhost:1337")

if err then
    print(err)
else
    print("> CONNECTED")
    while true do
        local message = ws.receive()
        print(message)
        local obj = json.decode(message)
        if obj.type == "eval" then
            local res = load(obj.msg)
            if res then
                print(res)
            end
        end
    end
end

print("Running...")