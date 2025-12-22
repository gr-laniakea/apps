I've linked an upgraded version of k8ts locally.

major changes in this version:

# Creating Files
To create a file, we use a World `W`.We create files like this:

```ts
W.FILE("file.yaml", {
    namespace: nsReference,
    meta: {
        //... current metadata 
    },
    FILE(FILE) {
        yield new Deployment("name", {
            // same props as FILE.Deployment receives currently
        })
    }
})
```

Factory to constructor mappings:

```
FILE.PersistentVolume => new Pv
File.PersistentVolumeClaim => new Pvc
File.X => new X
```
