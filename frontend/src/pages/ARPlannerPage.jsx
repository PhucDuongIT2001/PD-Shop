import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Search, Plus, Trash2, Save, ShoppingCart, 
  RotateCw, HelpCircle, Move, Layers, CheckCircle2, ChevronRight,
  Info, Loader2, Sparkles, FolderHeart
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { getProductImageUrl } from '../utils/imageUtils';

// Import pure Three.js components
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ARPlannerPage = () => {
  const navigate = useNavigate();
  
  // 3D Scene Refs
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  
  // States
  const [arProducts, setArProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [placedItems, setPlacedItems] = useState([]); // [{ uuid, productId, name, price, thumbnail, modelGlbUrl, mesh, posX, posY, posZ, rotY }]
  const [selectedItem, setSelectedItem] = useState(null); // Currently selected item for rotation/deletion
  const [layoutName, setLayoutName] = useState("");
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [loadingLayouts, setLoadingLayouts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingModelId, setLoadingModelId] = useState(null); // ID of product model currently downloading

  // Raycasting & Snap to floor (Y = 0)
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Ground plane at Y = 0
  const isDraggingRef = useRef(false);
  const dragItemRef = useRef(null);

  // Load active 3D assets on mount
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoadingProducts(true);
        const res = await api.get('/products/ar-assets');
        setArProducts(res.data || []);
      } catch (err) {
        console.error("Error loading 3D assets:", err);
        toast.error("Không thể tải danh sách mô hình 3D");
      } finally {
        setLoadingProducts(false);
      }
    };

    const loadUserLayouts = async () => {
      try {
        setLoadingLayouts(true);
        const res = await api.get('/ar-layouts');
        setSavedLayouts(res.data || []);
      } catch (err) {
        console.error("Error loading saved layouts:", err);
      } finally {
        setLoadingLayouts(false);
      }
    };

    loadAssets();
    loadUserLayouts();
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f8fafc'); // Light background slate-50
    sceneRef.current = scene;

    // 2. Camera
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5, 5, 8); // Angled view
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 0.8);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Subtle grid ceiling spotlight to make it premium
    const spotLight = new THREE.SpotLight('#3b82f6', 0.2); // Soft blue light
    spotLight.position.set(0, 8, 0);
    spotLight.angle = Math.PI / 4;
    scene.add(spotLight);

    // 5. Ground Grid (Representing room floor)
    const gridHelper = new THREE.GridHelper(10, 20, '#cbd5e1', '#e2e8f0');
    gridHelper.position.y = -0.01; // Slightly below floor
    scene.add(gridHelper);

    // Invisible ground plane for raycast dragging snapping
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 6. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't let camera go below floor
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controlsRef.current = controls;

    // 7. Animation Loop
    let animationFrameId;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Product drag & drop snapper events
  const handleCanvasPointerDown = (event) => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

    // Get relative mouse position
    const rect = canvasRef.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraRef.current);

    // Find if we clicked on any placed meshes
    const meshes = placedItems.filter(item => item && item.mesh).map(item => item.mesh);
    const intersects = raycaster.intersectObjects(meshes, true);

    if (intersects.length > 0) {
      // Find top-level group/mesh associated with the clicked object
      let targetMesh = intersects[0].object;
      while (targetMesh.parent && targetMesh.parent !== sceneRef.current) {
        targetMesh = targetMesh.parent;
      }

      // Find item in state
      const item = placedItems.find(p => p.mesh === targetMesh);
      if (item) {
        setSelectedItem(item);
        isDraggingRef.current = true;
        dragItemRef.current = item;
        controlsRef.current.enabled = false; // Disable orbit control while dragging
      }
    } else {
      setSelectedItem(null);
    }
  };

  const handleCanvasPointerMove = (event) => {
    if (!isDraggingRef.current || !dragItemRef.current || !cameraRef.current || !rendererRef.current) return;

    // Capture values into local variables to avoid race conditions when React queues state updates
    const dragItem = dragItemRef.current;
    const dragItemUuid = dragItem.uuid;
    const dragMesh = dragItem.mesh;

    const rect = canvasRef.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraRef.current);

    // Intersect with ground plane
    const intersectPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
      // Snap position to a 0.05m grid for neat alignment
      const snap = 0.05;
      const x = Math.round(intersectPoint.x / snap) * snap;
      const z = Math.round(intersectPoint.z / snap) * snap;

      // Keep within boundaries
      if (Math.abs(x) < 5 && Math.abs(z) < 5) {
        if (dragMesh) {
          dragMesh.position.set(x, 0, z);
        }

        // Update state position using captured UUID
        setPlacedItems(prev => prev.map(item => 
          (item && item.uuid === dragItemUuid)
            ? { ...item, posX: x, posZ: z }
            : item
        ));
      }
    }
  };

  const handleCanvasPointerUp = () => {
    isDraggingRef.current = false;
    dragItemRef.current = null;
    if (controlsRef.current) {
      controlsRef.current.enabled = true; // Re-enable orbit controls
    }
  };

  // Add 3D model to Room Canvas
  const placeProduct = async (product) => {
    if (!sceneRef.current) return;

    // Check if product has model GLB URL
    let glbUrl = product.modelGlbUrl || product.arModelUrl;
    if (!glbUrl) {
      toast.error("Sản phẩm này chưa được gán tập tin mô hình 3D (.glb)!");
      return;
    }

    // Format local upload URL
    if (!glbUrl.startsWith('http://') && !glbUrl.startsWith('https://') && !glbUrl.startsWith('/')) {
      glbUrl = `/uploads/${glbUrl}`;
    }

    try {
      setLoadingModelId(product.productId || product.id);
      const loader = new GLTFLoader();

      // Configure DRACOLoader for compressed models
      import('three/examples/jsm/loaders/DRACOLoader.js').then(({ DRACOLoader }) => {
          const dracoLoader = new DRACOLoader();
          dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
          loader.setDRACOLoader(dracoLoader);

          loader.load(
            glbUrl,
            (gltf) => {
              const mesh = gltf.scene;

              // Scale and orient model
              mesh.position.set(0, 0, 0); // Center of grid
              
              // Compute bounding box to set default scale nicely
              const box = new THREE.Box3().setFromObject(mesh);
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              
              // Tự động chuẩn hóa kích thước vật thể ngoài đời thực
              let targetSize = 1.0; // Mặc định 1 mét
              const nameLower = (product.productName || product.name || '').toLowerCase();
              if (nameLower.includes('phone') || nameLower.includes('samsung') || nameLower.includes('iphone')) {
                targetSize = 0.18; // iPhone/Điện thoại khoảng 18cm (hơi phóng to chút để dễ nhìn thấy)
              } else if (nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('computer')) {
                targetSize = 0.45; // Laptop khoảng 45cm
              } else if (nameLower.includes('chair') || nameLower.includes('ghế')) {
                targetSize = 0.75; // Ghế khoảng 75cm
              } else if (nameLower.includes('table') || nameLower.includes('bàn') || nameLower.includes('desk')) {
                targetSize = 1.5; // Bàn khoảng 1.5 mét
              }
              
              const scaleFactor = targetSize / (maxDim || 1.0);
              mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

              // Enable shadows
              mesh.traverse((node) => {
                if (node.isMesh) {
                  node.castShadow = true;
                  node.receiveShadow = true;
                }
              });

              // Add to Three.js Scene
              sceneRef.current.add(mesh);

              // Create new placed item object
              const newItem = {
                uuid: THREE.MathUtils.generateUUID(),
                productId: product.productId || product.id,
                name: product.productName || product.name,
                price: product.productPrice || product.price,
                thumbnail: product.productThumbnail || product.thumbnail || product.image,
                modelGlbUrl: glbUrl,
                mesh: mesh,
                posX: 0.0,
                posY: 0.0,
                posZ: 0.0,
                rotY: 0.0
              };

              setPlacedItems(prev => [...prev, newItem]);
              setSelectedItem(newItem);
              toast.success(`Đã thêm ${newItem.name} vào bản thiết kế!`);
              setLoadingModelId(null);
            },
            (xhr) => {
              // Progress logging
              const pct = Math.round((xhr.loaded / xhr.total) * 100);
              console.log(`Downloading model: ${pct}%`);
            },
            (error) => {
              console.error("Error loading GLTF model:", error);
              const errMsg = error.message || error.toString() || "Unknown error";
              toast.error("Lỗi khi tải mô hình 3D: " + errMsg);
              setLoadingModelId(null);
            }
          );
      }).catch(err => {
          console.error("Failed to load DRACOLoader", err);
          toast.error("Lỗi nạp bộ giải mã 3D");
          setLoadingModelId(null);
      });

    } catch (err) {
      console.error(err);
      setLoadingModelId(null);
    }
  };

  // Rotate selected item
  const handleRotate = (uuid, value) => {
    const angleRad = (value * Math.PI) / 180;
    setPlacedItems(prev => prev.map(item => {
      if (item && item.uuid === uuid) {
        if (item.mesh) {
          item.mesh.rotation.y = angleRad;
        }
        return { ...item, rotY: parseFloat(value) };
      }
      return item;
    }));
  };

  // Remove item from room
  const removeItem = (uuid) => {
    const item = placedItems.find(p => p && p.uuid === uuid);
    if (!item) return;

    if (sceneRef.current && item.mesh) {
      sceneRef.current.remove(item.mesh);
    }

    setPlacedItems(prev => prev.filter(p => p && p.uuid !== uuid));
    if (selectedItem?.uuid === uuid) {
      setSelectedItem(null);
    }
    toast.success(`Đã xóa ${item.name || "sản phẩm"} khỏi thiết kế`);
  };

  // Clear all items in room
  const clearRoom = () => {
    if (placedItems.length === 0) return;
    if (!window.confirm("Bạn có chắc chắn muốn làm sạch toàn bộ bản thiết kế này?")) return;

    placedItems.forEach(item => {
      if (item && item.mesh) {
        sceneRef.current?.remove(item.mesh);
      }
    });
    setPlacedItems([]);
    setSelectedItem(null);
    toast.success("Đã làm sạch bản thiết kế!");
  };

  // Calculate total price of room items
  const calculateTotal = () => {
    return placedItems.reduce((acc, curr) => acc + (curr ? curr.price : 0), 0);
  };

  // Save layout configuration to database
  const saveLayout = async () => {
    if (placedItems.length === 0) {
      toast.error("Hãy thêm ít nhất một sản phẩm vào lưới 3D trước khi lưu!");
      return;
    }

    const name = layoutName.trim() || `Bản thiết kế ngày ${new Date().toLocaleDateString()}`;
    
    // Package items for DB
    const itemsReq = placedItems.filter(item => item).map(item => ({
      productId: item.productId,
      posX: item.posX,
      posY: item.posY,
      posZ: item.posZ,
      rotY: item.rotY
    }));

    try {
      setIsSaving(true);
      const res = await api.post('/ar-layouts', {
        name: name,
        items: itemsReq
      });

      toast.success("Lưu bản thiết kế phòng thành công!");
      
      // Update saved layouts list
      setSavedLayouts(prev => [res.data, ...prev]);
      setLayoutName("");
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu bản thiết kế lên máy chủ");
    } finally {
      setIsSaving(false);
    }
  };

  // Load a saved layout from database
  const loadLayout = async (layoutDto) => {
    if (placedItems.length > 0) {
      if (!window.confirm("Bản thiết kế hiện tại sẽ bị xóa sạch để tải bản vẽ mới. Tiếp tục?")) return;
    }

    // Clear existing
    placedItems.forEach(item => {
      if (item && item.mesh) {
        sceneRef.current?.remove(item.mesh);
      }
    });
    setPlacedItems([]);
    setSelectedItem(null);

    toast.loading("Đang tải dữ liệu mô hình 3D...");

    try {
      const loader = new GLTFLoader();

      for (const itemDto of layoutDto.items) {
        // Find GLB model link
        const glbUrl = itemDto.modelGlbUrl;
        if (!glbUrl) continue;

        await new Promise((resolve, reject) => {
          loader.load(
            glbUrl,
            (gltf) => {
              const mesh = gltf.scene;
              
              // Restore coordinates
              mesh.position.set(itemDto.posX, itemDto.posY, itemDto.posZ);
              mesh.rotation.y = (itemDto.rotY * Math.PI) / 180;
              
              // Tự động chuẩn hóa kích thước vật thể khi load lại bản vẽ
              const box = new THREE.Box3().setFromObject(mesh);
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              
              let targetSize = 1.0;
              const nameLower = (itemDto.productName || '').toLowerCase();
              if (nameLower.includes('phone') || nameLower.includes('samsung') || nameLower.includes('iphone')) {
                targetSize = 0.18;
              } else if (nameLower.includes('laptop') || nameLower.includes('macbook') || nameLower.includes('computer')) {
                targetSize = 0.45;
              } else if (nameLower.includes('chair') || nameLower.includes('ghế')) {
                targetSize = 0.75;
              } else if (nameLower.includes('table') || nameLower.includes('bàn') || nameLower.includes('desk')) {
                targetSize = 1.5;
              }
              
              const scaleFactor = targetSize / (maxDim || 1.0);
              mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);

              // Enable shadows
              mesh.traverse((node) => {
                if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; }
              });

              sceneRef.current.add(mesh);

              // Add to state
              const newItem = {
                uuid: THREE.MathUtils.generateUUID(),
                productId: itemDto.productId,
                name: itemDto.productName,
                price: itemDto.productPrice,
                thumbnail: itemDto.productThumbnail,
                modelGlbUrl: glbUrl,
                mesh: mesh,
                posX: itemDto.posX,
                posY: itemDto.posY,
                posZ: itemDto.posZ,
                rotY: itemDto.rotY
              };

              setPlacedItems(prev => [...prev, newItem]);
              resolve();
            },
            undefined,
            (err) => {
              console.error(err);
              resolve(); // Proactively continue loading other items even if one fails
            }
          );
        });
      }
      toast.dismiss();
      toast.success(`Đã tải thành công bản thiết kế "${layoutDto.name}"!`);
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Lỗi khi tải chi tiết bản vẽ");
    }
  };

  // Add all room items to cart
  const addAllToCart = async () => {
    if (placedItems.length === 0) return;

    try {
      toast.loading("Đang thêm toàn bộ sản phẩm vào giỏ hàng...");

      // Call add to cart endpoint for each item
      for (const item of placedItems) {
        if (!item) continue;
        // Format payload based on shopping cart requirements
        await api.post('/cart', {
          productId: item.productId,
          quantity: 1
        });
      }

      toast.dismiss();
      toast.success("Đã thêm toàn bộ sản phẩm ảo vào Giỏ hàng thực tế!");
      navigate('/cart');
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Lỗi khi đồng bộ sản phẩm vào Giỏ hàng");
    }
  };

  const filteredProducts = arProducts.filter(p =>
    (p.productName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header Actions */}
      <header className="h-16 shrink-0 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block animate-pulse"></span>
            <h1 className="text-md font-black uppercase italic tracking-wider text-white">AR Studio - Thiết Kế Phòng</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-[10px] font-bold text-slate-400">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Kéo thả vật thể trên lưới. Dùng chuột phải để xoay/pan camera.</span>
          </div>
          <button 
            onClick={clearRoom}
            disabled={placedItems.length === 0}
            className="px-4 py-2 border border-red-500/20 hover:border-red-500 text-red-500 hover:bg-red-500/10 font-bold rounded-xl text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Làm sạch lưới
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar: Product Catalog */}
        <aside className="w-full md:w-80 shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/80 backdrop-blur">
          <div className="p-4 border-b border-slate-800">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
              <input 
                type="text" 
                placeholder="Tìm sản phẩm 3D..."
                className="w-full bg-slate-900 border-none rounded-xl py-2 px-9 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-200"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Model Catalog */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 no-scrollbar">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Thư viện mô hình 3D</span>
            
            {loadingProducts ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <p className="text-xs text-slate-500 font-bold">Đang tải thư viện 3D...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10 font-bold">Không tìm thấy sản phẩm 3D nào</p>
            ) : (
              filteredProducts.map(product => (
                <div 
                  key={product.productId}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex gap-3 hover:border-blue-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                    <img 
                      src={getProductImageUrl(product.productThumbnail)} 
                      alt={product.productName} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white uppercase italic tracking-tighter truncate">{product.productName}</p>
                    <p className="text-[11px] font-black text-blue-500 italic mt-0.5">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.productPrice || 0)}
                    </p>
                    <button 
                      onClick={() => placeProduct(product)}
                      disabled={loadingModelId !== null}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg text-[10px] font-black uppercase italic tracking-wider transition-colors"
                    >
                      {loadingModelId === product.productId ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Đang tải 3D...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          Đưa vào phòng
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Central 3D Canvas */}
        <div 
          ref={containerRef}
          className="flex-grow relative bg-slate-900 overflow-hidden cursor-move"
        >
          <canvas 
            ref={canvasRef} 
            className="w-full h-full block outline-none"
            onPointerDown={handleCanvasPointerDown}
            onPointerMove={handleCanvasPointerMove}
            onPointerUp={handleCanvasPointerUp}
          />

          {/* Quick HUD Instructions */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-slate-950/80 backdrop-blur border border-slate-800 p-4 rounded-2xl shadow-xl max-w-xs">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Hướng dẫn thao tác
            </span>
            <ul className="text-[10px] text-slate-400 font-bold space-y-1.5 list-disc pl-4 mt-1">
              <li>Click Chuột Trái + Kéo để **Kéo thả vật thể**</li>
              <li>Click Chuột Trái vào khoảng trống để xoay camera</li>
              <li>Click Chuột Phải / Phím Shift để **Di chuyển camera**</li>
              <li>Lăn chuột để **Phóng to/Thu nhỏ**</li>
            </ul>
          </div>
        </div>

        {/* Right Sidebar: Placed Items, Saved Designs & Canvas Controls */}
        <aside className="w-full md:w-80 shrink-0 border-l border-slate-800 bg-slate-950/80 backdrop-blur flex flex-col">
          {/* Section: Selected / Placed Items */}
          <div className="p-4 border-b border-slate-800">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Vật thể đang chọn</span>
            {selectedItem ? (
              <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 space-y-4">
                <div className="flex gap-3">
                  <img src={getProductImageUrl(selectedItem.thumbnail)} className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0" alt="" />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase italic tracking-tighter truncate w-44">{selectedItem.name}</h4>
                    <p className="text-[10px] font-black text-blue-500">{new Intl.NumberFormat('vi-VN').format(selectedItem.price)} đ</p>
                  </div>
                </div>

                {/* Y-Rotation slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1"><RotateCw className="w-3.5 h-3.5 text-blue-500" /> Góc xoay vật thể</span>
                    <span>{selectedItem.rotY}°</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="360" 
                    value={selectedItem.rotY}
                    onChange={(e) => handleRotate(selectedItem.uuid, e.target.value)}
                    className="w-full accent-blue-600 cursor-pointer bg-slate-800 h-1 rounded-full outline-none"
                  />
                </div>

                <button 
                  onClick={() => removeItem(selectedItem.uuid)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Xóa khỏi phòng
                </button>
              </div>
            ) : (
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl py-6 text-center text-xs text-slate-500 font-bold italic flex flex-col items-center justify-center gap-2">
                <Move className="w-6 h-6 text-slate-600 animate-pulse" />
                <span>Nhấp chọn 1 vật thể trên lưới để bắt đầu xoay/xoá</span>
              </div>
            )}
          </div>

          {/* Section: Save / Load Design */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
            {/* Save Form */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Lưu bản vẽ hiện tại</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Đặt tên cho thiết kế..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none font-medium text-slate-200"
                  value={layoutName}
                  onChange={e => setLayoutName(e.target.value)}
                />
                <button
                  onClick={saveLayout}
                  disabled={isSaving || placedItems.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-xl text-xs font-black uppercase italic tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Lưu
                </button>
              </div>
            </div>

            {/* Saved Layouts List */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block flex items-center gap-1.5">
                <FolderHeart className="w-3.5 h-3.5 text-pink-500" /> Bản vẽ của tôi
              </span>

              {loadingLayouts ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : savedLayouts.length === 0 ? (
                <p className="text-[11px] text-slate-600 text-center py-6 font-bold italic">Bạn chưa lưu bản thiết kế nào</p>
              ) : (
                <div className="space-y-2 max-h-[180px] overflow-y-auto no-scrollbar">
                  {savedLayouts.map(layout => (
                    <div 
                      key={layout.id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between hover:border-slate-700 transition-colors group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-slate-200 truncate">{layout.name}</p>
                        <p className="text-[9px] text-slate-500 font-bold">{layout.items?.length || 0} sản phẩm 3D</p>
                      </div>
                      <button 
                        onClick={() => loadLayout(layout)}
                        className="px-2 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg text-[9px] font-bold uppercase transition-all"
                      >
                        Tải phòng
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Panel: Pricing, Cart & Checkout */}
      <footer className="h-20 shrink-0 bg-slate-950 border-t border-slate-800 flex items-center justify-between px-6 z-10">
        <div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Đã xếp trong phòng</span>
          <span className="text-xs font-black text-white italic tracking-tighter uppercase">{placedItems.length} Vật Thể Ảo</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Tổng giá trị cả phòng</span>
            <span className="text-lg font-black text-blue-500 italic tracking-tighter">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
            </span>
          </div>

          <button 
            onClick={addAllToCart}
            disabled={placedItems.length === 0}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-black uppercase italic tracking-tighter rounded-2xl text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm cả bộ vào giỏ hàng
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ARPlannerPage;
