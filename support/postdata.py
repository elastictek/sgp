class PostData:
    def __init__(self,request):
        self.options = request.data.get("options") if request.data.get("options") is not None else {}
        self.apiversion=None
        if "apiversion" in self.options and self.options.get("apiversion")!="":
            self.apiversion = self.options.get("apiversion")
        self.norun=False
        if "norun" in self.options and self.options.get("norun")!="":
            self.norun = self.options.get("norun")

        self.data = request.data.get("parameters") if request.data.get("parameters") is not None else {}
        self.filter = request.data.get("filter") if request.data.get("filter") is not None else {}
        self.sort = request.data.get("sort") if request.data.get("sort") is not None else []