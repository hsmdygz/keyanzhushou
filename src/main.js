import {
	createSSRApp
} from "vue";
import App from "./App.vue";
import './static/css/common.scss'

// 桌面应用优化
if (process.env.UNI_PLATFORM === 'h5') {
	try {
		document.addEventListener('DOMContentLoaded', function() {
			// 设置最佳桌面显示
			const metaViewport = document.querySelector('meta[name="viewport"]');
			if (metaViewport) {
				metaViewport.content = 'width=device-width, initial-scale=1.0';
			}
			
			// 防止拖动和选择文本
			document.body.style.userSelect = 'none';
			document.body.style.webkitUserSelect = 'none';
			document.body.style.msUserSelect = 'none';
			
			// 禁用右键菜单
			document.addEventListener('contextmenu', function(e) {
				e.preventDefault();
			});
		});
	} catch (e) {
		console.error('桌面环境优化失败:', e);
	}
}

export function createApp() {
	const app = createSSRApp(App);
	
	return {
		app,
	};
}
