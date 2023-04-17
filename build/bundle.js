
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.58.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var SwipeDirection;
    (function (SwipeDirection) {
        SwipeDirection[SwipeDirection["None"] = 0] = "None";
        SwipeDirection[SwipeDirection["Left"] = 1] = "Left";
        SwipeDirection[SwipeDirection["Right"] = 2] = "Right";
        SwipeDirection[SwipeDirection["Up"] = 3] = "Up";
        SwipeDirection[SwipeDirection["Down"] = 4] = "Down";
    })(SwipeDirection || (SwipeDirection = {}));
    const swipeThreshold = 50;
    class Cup {
        constructor(row, column, id) {
            this.active = true;
            this.row = row;
            this.column = column;
            this.id = id;
            this.active = true;
        }
        match(row, column) {
            return this.row === row && this.column === column;
        }
        isActive() {
            return this.active;
        }
        setInactive() {
            this.active = false;
        }
    }
    class CupManager {
        constructor() {
            this.cups = [];
        }
        addCup(cup) {
            this.cups.push(cup);
        }
        getCup(row, column) {
            return this.cups.find(cup => cup.match(row, column));
        }
        getCupByIndex(index) {
            if (index < 0 || index >= this.cups.length) {
                return null;
            }
            return this.cups[index];
        }
        getMatchingCup(row, column) {
            let cup;
            this.cups.forEach(c => {
                if (!c.isActive()) {
                    return;
                }
                if (c.match(row, column)) {
                    cup = c;
                }
            });
            return cup;
        }
    }
    class Swipe {
        static getDirection(start, end) {
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const adx = Math.abs(dx);
            const ady = Math.abs(dy);
            if (adx < swipeThreshold && ady < swipeThreshold) {
                return SwipeDirection.None;
            }
            if (adx > ady) {
                if (dx > 0) {
                    return SwipeDirection.Right;
                }
                else {
                    return SwipeDirection.Left;
                }
            }
            else {
                if (dy > 0) {
                    return SwipeDirection.Down;
                }
                else {
                    return SwipeDirection.Up;
                }
            }
        }
        static getAngle(start, end) {
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            return Math.atan2(dy, dx) * 180 / Math.PI;
        }
        static getLength(start, end) {
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            return Math.sqrt(dx * dx + dy * dy);
        }
    }
    // function that checks if given number is in the range of the other two numbers
    function inRange(value, min, max) {
        return value >= min && value <= max;
    }
    class RangeCheck {
        constructor(number) {
            this.number = number;
        }
        in(min, max) {
            return inRange(this.number, min, max);
        }
    }
    class Position {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    /* src\components\BirthdayCake\Candle.svelte generated by Svelte v3.58.0 */

    const { console: console_1$6 } = globals;
    const file$f = "src\\components\\BirthdayCake\\Candle.svelte";

    function create_fragment$h(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "candle svelte-1yvxd4m");
    			add_location(div0, file$f, 29, 8, 840);
    			attr_dev(div1, "class", "flame svelte-1yvxd4m");
    			toggle_class(div1, "off", !/*burning*/ ctx[2]);
    			add_location(div1, file$f, 30, 8, 876);
    			attr_dev(div2, "class", "wrapper svelte-1yvxd4m");
    			add_location(div2, file$f, 28, 4, 766);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			/*div1_binding*/ ctx[7](div1);
    			/*div2_binding*/ ctx[8](div2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div1, "click", /*onBlowCandle*/ ctx[3], false, false, false, false),
    					listen_dev(div2, "click", /*onBlowCandle*/ ctx[3], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*burning*/ 4) {
    				toggle_class(div1, "off", !/*burning*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			/*div1_binding*/ ctx[7](null);
    			/*div2_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Candle', slots, []);
    	let { x } = $$props;
    	let { y } = $$props;
    	let { scale = 1 } = $$props;
    	let candle;
    	let flame;

    	// create event dispatcher
    	const dispatch = createEventDispatcher();

    	onMount(() => {
    		// set top and left position
    		$$invalidate(0, candle.style.top = `${y}px`, candle);

    		$$invalidate(0, candle.style.left = `${x}px`, candle);
    		console.debug("Candle mounted");
    	});

    	let burning = true;

    	function onBlowCandle() {
    		// remove event listener
    		candle.removeEventListener('click', onBlowCandle);

    		flame.removeEventListener('click', onBlowCandle);
    		$$invalidate(2, burning = false);

    		// dispatch blowed event
    		dispatch('blowed');
    	}

    	$$self.$$.on_mount.push(function () {
    		if (x === undefined && !('x' in $$props || $$self.$$.bound[$$self.$$.props['x']])) {
    			console_1$6.warn("<Candle> was created without expected prop 'x'");
    		}

    		if (y === undefined && !('y' in $$props || $$self.$$.bound[$$self.$$.props['y']])) {
    			console_1$6.warn("<Candle> was created without expected prop 'y'");
    		}
    	});

    	const writable_props = ['x', 'y', 'scale'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$6.warn(`<Candle> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			flame = $$value;
    			$$invalidate(1, flame);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			candle = $$value;
    			$$invalidate(0, candle);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('scale' in $$props) $$invalidate(6, scale = $$props.scale);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		x,
    		y,
    		scale,
    		candle,
    		flame,
    		dispatch,
    		burning,
    		onBlowCandle
    	});

    	$$self.$inject_state = $$props => {
    		if ('x' in $$props) $$invalidate(4, x = $$props.x);
    		if ('y' in $$props) $$invalidate(5, y = $$props.y);
    		if ('scale' in $$props) $$invalidate(6, scale = $$props.scale);
    		if ('candle' in $$props) $$invalidate(0, candle = $$props.candle);
    		if ('flame' in $$props) $$invalidate(1, flame = $$props.flame);
    		if ('burning' in $$props) $$invalidate(2, burning = $$props.burning);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [candle, flame, burning, onBlowCandle, x, y, scale, div1_binding, div2_binding];
    }

    class Candle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { x: 4, y: 5, scale: 6 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Candle",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get x() {
    		throw new Error("<Candle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Candle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Candle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Candle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scale() {
    		throw new Error("<Candle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scale(value) {
    		throw new Error("<Candle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\TouchGesture.svelte generated by Svelte v3.58.0 */

    const { console: console_1$5 } = globals;
    const file$e = "src\\components\\TouchGesture.svelte";

    function create_fragment$g(ctx) {
    	let canvas_1;
    	let t;
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			canvas_1 = element("canvas");
    			t = space();
    			div = element("div");
    			set_style(canvas_1, "position", "absolute");
    			set_style(canvas_1, "top", "0");
    			set_style(canvas_1, "left", "0");
    			set_style(canvas_1, "z-index", "888");
    			add_location(canvas_1, file$e, 157, 4, 4548);
    			attr_dev(div, "class", "touch-gesture svelte-kirm9b");
    			add_location(div, file$e, 159, 4, 4690);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, canvas_1, anchor);
    			/*canvas_1_binding*/ ctx[5](canvas_1);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mousedown", /*onMouseDown*/ ctx[3], false, false, false, false),
    					listen_dev(div, "mouseup", /*onMouseUp*/ ctx[4], false, false, false, false),
    					listen_dev(div, "touchstart", /*onTouchStart*/ ctx[1], false, false, false, false),
    					listen_dev(div, "touchend", /*onTouchEnd*/ ctx[2], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(canvas_1);
    			/*canvas_1_binding*/ ctx[5](null);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TouchGesture', slots, []);
    	const dispatch = createEventDispatcher();

    	/* The start and end position of the swipe */
    	let posStart = new Position(0, 0);

    	/* The end position of the swipe */
    	let posEnd = new Position(0, 0);

    	// canvas for drawing debug lines
    	let canvas;

    	let ctx;

    	onMount(() => {
    		ctx = canvas.getContext('2d');
    		$$invalidate(0, canvas.width = window.innerWidth, canvas);
    		$$invalidate(0, canvas.height = window.innerHeight, canvas);
    		return;
    	});

    	function drawRedLineBetweenPositions(pos1, pos2) {
    		ctx.beginPath();
    		ctx.moveTo(pos1.x, pos1.y);
    		ctx.lineTo(pos2.x, pos2.y);
    		ctx.strokeStyle = 'red';
    		ctx.stroke();

    		// draw two red circles at the start and end position
    		ctx.beginPath();

    		ctx.arc(pos1.x, pos1.y, 10, 0, 2 * Math.PI);
    		ctx.fillStyle = 'red';
    		ctx.fill();
    		ctx.beginPath();
    		ctx.arc(pos2.x, pos2.y, 10, 0, 2 * Math.PI);
    		ctx.fillStyle = 'red';
    		ctx.fill();
    	}

    	function drawLoop() {
    		ctx.clearRect(0, 0, canvas.width, canvas.height);
    		drawRedLineBetweenPositions(posStart, posEnd);
    		requestAnimationFrame(drawLoop);
    	}

    	/*
     * Get the start position of the swipe
     */
    	function onTouchStart(event) {
    		posStart.x = event.touches[0].clientX;
    		posStart.y = event.touches[0].clientY;
    	}

    	/*
     * Get the end position of the swipe
     */
    	function onTouchEnd(event) {
    		posEnd.x = event.changedTouches[0].clientX;
    		posEnd.y = event.changedTouches[0].clientY;
    		determineSwipeDirection();
    	}

    	/*
     * Determine the swipe direction and dispatch the swipe event
     */
    	function determineSwipeDirection() {
    		let angle = determineSwipeAngle();
    		let length = determineSwipeLength();
    		let range = new RangeCheck(angle);
    		let angleStr;

    		if (range.in(-20, 20)) {
    			angleStr = 'straight';
    		} else if (range.in(-60, -20)) {
    			angleStr = 'left';
    		} else if (range.in(20, 60)) {
    			angleStr = 'right';
    		} else if (angle > 60) {
    			angleStr = 'too far right';
    		} else if (angle < -60) {
    			angleStr = 'too far left';
    		} else {
    			angleStr = "no idea";
    		}

    		var lengthPercent = length / window.innerHeight * 100;
    		var lengthStr;
    		var rangeLen = new RangeCheck(lengthPercent);

    		if (rangeLen.in(0, 10)) {
    			lengthStr = 'too short';
    		} else if (rangeLen.in(10, 20)) {
    			lengthStr = 'short';
    		} else if (rangeLen.in(20, 30)) {
    			lengthStr = 'medium';
    		} else if (rangeLen.in(30, 40)) {
    			lengthStr = 'long';
    		} else {
    			lengthStr = 'too long';
    		}

    		// Get the swipe direction
    		let swipeDirection = Swipe.getDirection(posStart, posEnd);

    		/* If the swipe direction is not none, dispatch the swipe event */
    		if (swipeDirection !== SwipeDirection.None) {
    			/* dispatch swipe detail information */
    			dispatch('swipeDetail', {
    				angle,
    				length,
    				direction: swipeDirection,
    				pos1: posStart,
    				pos2: posEnd,
    				angleStr,
    				lengthStr
    			});

    			/* Dispatch the swipe event as a generic event */
    			dispatch('swipe', swipeDirection);

    			/* Dispatch the swipe event as a specific event */
    			switch (swipeDirection) {
    				case SwipeDirection.Up:
    					dispatch('swipeUp');
    					break;
    				case SwipeDirection.Down:
    					dispatch('swipeDown');
    					break;
    				case SwipeDirection.Left:
    					dispatch('swipeLeft');
    					break;
    				case SwipeDirection.Right:
    					dispatch('swipeRight');
    					break;
    			}
    		} else {
    			dispatch('tap');
    		}
    	}

    	function onMouseDown(event) {
    		posStart.x = event.clientX;
    		posStart.y = event.clientY;
    	}

    	function onMouseUp(event) {
    		posEnd.x = event.clientX;
    		posEnd.y = event.clientY;
    		determineSwipeDirection();
    	}

    	function determineSwipeAngle() {
    		let angle = Swipe.getAngle(posStart, posEnd);
    		console.log(angle);
    		return angle;
    	}

    	function determineSwipeLength() {
    		let length = Swipe.getLength(posStart, posEnd);
    		console.log(length);
    		return length;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$5.warn(`<TouchGesture> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({
    		CupManager,
    		Cup,
    		SwipeDirection,
    		Swipe,
    		Position,
    		RangeCheck,
    		createEventDispatcher,
    		onMount,
    		Candle,
    		dispatch,
    		posStart,
    		posEnd,
    		canvas,
    		ctx,
    		drawRedLineBetweenPositions,
    		drawLoop,
    		onTouchStart,
    		onTouchEnd,
    		determineSwipeDirection,
    		onMouseDown,
    		onMouseUp,
    		determineSwipeAngle,
    		determineSwipeLength
    	});

    	$$self.$inject_state = $$props => {
    		if ('posStart' in $$props) posStart = $$props.posStart;
    		if ('posEnd' in $$props) posEnd = $$props.posEnd;
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    		if ('ctx' in $$props) ctx = $$props.ctx;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canvas, onTouchStart, onTouchEnd, onMouseDown, onMouseUp, canvas_1_binding];
    }

    class TouchGesture extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TouchGesture",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /* src\components\AppContainer.svelte generated by Svelte v3.58.0 */

    const file$d = "src\\components\\AppContainer.svelte";

    function create_fragment$f(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "app-container svelte-1pbtp2");
    			add_location(div, file$d, 3, 4, 37);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AppContainer', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AppContainer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class AppContainer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AppContainer",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    /* node_modules\svelte-confetti\src\Confetti.svelte generated by Svelte v3.58.0 */
    const file$c = "node_modules\\svelte-confetti\\src\\Confetti.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (41:0) {#if !complete}
    function create_if_block(ctx) {
    	let div;
    	let each_value = { length: /*amount*/ ctx[6] };
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "confetti-holder svelte-12gjlm7");
    			toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			toggle_class(div, "cone", /*cone*/ ctx[10]);
    			toggle_class(div, "no-gravity", /*noGravity*/ ctx[11]);
    			add_location(div, file$c, 41, 2, 1104);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div, null);
    				}
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fallDistance, size, getColor, randomBetween, y, x, infinite, duration, delay, iterationCount, xSpread, amount*/ 20991) {
    				each_value = { length: /*amount*/ ctx[6] };
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*rounded*/ 512) {
    				toggle_class(div, "rounded", /*rounded*/ ctx[9]);
    			}

    			if (dirty & /*cone*/ 1024) {
    				toggle_class(div, "cone", /*cone*/ ctx[10]);
    			}

    			if (dirty & /*noGravity*/ 2048) {
    				toggle_class(div, "no-gravity", /*noGravity*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(41:0) {#if !complete}",
    		ctx
    	});

    	return block;
    }

    // (43:4) {#each { length: amount } as _}
    function create_each_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "confetti svelte-12gjlm7");
    			set_style(div, "--fall-distance", /*fallDistance*/ ctx[8]);
    			set_style(div, "--size", /*size*/ ctx[0] + "px");
    			set_style(div, "--color", /*getColor*/ ctx[14]());
    			set_style(div, "--skew", randomBetween(-45, 45) + "deg," + randomBetween(-45, 45) + "deg");
    			set_style(div, "--rotation-xyz", randomBetween(-10, 10) + ", " + randomBetween(-10, 10) + ", " + randomBetween(-10, 10));
    			set_style(div, "--rotation-deg", randomBetween(0, 360) + "deg");
    			set_style(div, "--translate-y-multiplier", randomBetween(/*y*/ ctx[2][0], /*y*/ ctx[2][1]));
    			set_style(div, "--translate-x-multiplier", randomBetween(/*x*/ ctx[1][0], /*x*/ ctx[1][1]));
    			set_style(div, "--scale", 0.1 * randomBetween(2, 10));

    			set_style(div, "--transition-duration", /*infinite*/ ctx[4]
    			? `calc(${/*duration*/ ctx[3]}ms * var(--scale))`
    			: `${/*duration*/ ctx[3]}ms`);

    			set_style(div, "--transition-delay", randomBetween(/*delay*/ ctx[5][0], /*delay*/ ctx[5][1]) + "ms");

    			set_style(div, "--transition-iteration-count", /*infinite*/ ctx[4]
    			? 'infinite'
    			: /*iterationCount*/ ctx[7]);

    			set_style(div, "--x-spread", 1 - /*xSpread*/ ctx[12]);
    			add_location(div, file$c, 43, 6, 1232);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fallDistance*/ 256) {
    				set_style(div, "--fall-distance", /*fallDistance*/ ctx[8]);
    			}

    			if (dirty & /*size*/ 1) {
    				set_style(div, "--size", /*size*/ ctx[0] + "px");
    			}

    			if (dirty & /*y*/ 4) {
    				set_style(div, "--translate-y-multiplier", randomBetween(/*y*/ ctx[2][0], /*y*/ ctx[2][1]));
    			}

    			if (dirty & /*x*/ 2) {
    				set_style(div, "--translate-x-multiplier", randomBetween(/*x*/ ctx[1][0], /*x*/ ctx[1][1]));
    			}

    			if (dirty & /*infinite, duration*/ 24) {
    				set_style(div, "--transition-duration", /*infinite*/ ctx[4]
    				? `calc(${/*duration*/ ctx[3]}ms * var(--scale))`
    				: `${/*duration*/ ctx[3]}ms`);
    			}

    			if (dirty & /*delay*/ 32) {
    				set_style(div, "--transition-delay", randomBetween(/*delay*/ ctx[5][0], /*delay*/ ctx[5][1]) + "ms");
    			}

    			if (dirty & /*infinite, iterationCount*/ 144) {
    				set_style(div, "--transition-iteration-count", /*infinite*/ ctx[4]
    				? 'infinite'
    				: /*iterationCount*/ ctx[7]);
    			}

    			if (dirty & /*xSpread*/ 4096) {
    				set_style(div, "--x-spread", 1 - /*xSpread*/ ctx[12]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(43:4) {#each { length: amount } as _}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let if_block = !/*complete*/ ctx[13] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*complete*/ ctx[13]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function randomBetween(min, max) {
    	return Math.random() * (max - min) + min;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Confetti', slots, []);
    	let { size = 10 } = $$props;
    	let { x = [-0.5, 0.5] } = $$props;
    	let { y = [0.25, 1] } = $$props;
    	let { duration = 2000 } = $$props;
    	let { infinite = false } = $$props;
    	let { delay = [0, 50] } = $$props;
    	let { colorRange = [0, 360] } = $$props;
    	let { colorArray = [] } = $$props;
    	let { amount = 50 } = $$props;
    	let { iterationCount = 1 } = $$props;
    	let { fallDistance = "100px" } = $$props;
    	let { rounded = false } = $$props;
    	let { cone = false } = $$props;
    	let { noGravity = false } = $$props;
    	let { xSpread = 0.15 } = $$props;
    	let { destroyOnComplete = true } = $$props;
    	let complete = false;

    	onMount(() => {
    		if (!destroyOnComplete || infinite || iterationCount == "infinite") return;
    		setTimeout(() => $$invalidate(13, complete = true), (duration + delay[1]) * iterationCount);
    	});

    	function getColor() {
    		if (colorArray.length) return colorArray[Math.round(Math.random() * (colorArray.length - 1))]; else return `hsl(${Math.round(randomBetween(colorRange[0], colorRange[1]))}, 75%, 50%`;
    	}

    	const writable_props = [
    		'size',
    		'x',
    		'y',
    		'duration',
    		'infinite',
    		'delay',
    		'colorRange',
    		'colorArray',
    		'amount',
    		'iterationCount',
    		'fallDistance',
    		'rounded',
    		'cone',
    		'noGravity',
    		'xSpread',
    		'destroyOnComplete'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Confetti> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('x' in $$props) $$invalidate(1, x = $$props.x);
    		if ('y' in $$props) $$invalidate(2, y = $$props.y);
    		if ('duration' in $$props) $$invalidate(3, duration = $$props.duration);
    		if ('infinite' in $$props) $$invalidate(4, infinite = $$props.infinite);
    		if ('delay' in $$props) $$invalidate(5, delay = $$props.delay);
    		if ('colorRange' in $$props) $$invalidate(15, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(16, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    		if ('noGravity' in $$props) $$invalidate(11, noGravity = $$props.noGravity);
    		if ('xSpread' in $$props) $$invalidate(12, xSpread = $$props.xSpread);
    		if ('destroyOnComplete' in $$props) $$invalidate(17, destroyOnComplete = $$props.destroyOnComplete);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		size,
    		x,
    		y,
    		duration,
    		infinite,
    		delay,
    		colorRange,
    		colorArray,
    		amount,
    		iterationCount,
    		fallDistance,
    		rounded,
    		cone,
    		noGravity,
    		xSpread,
    		destroyOnComplete,
    		complete,
    		randomBetween,
    		getColor
    	});

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('x' in $$props) $$invalidate(1, x = $$props.x);
    		if ('y' in $$props) $$invalidate(2, y = $$props.y);
    		if ('duration' in $$props) $$invalidate(3, duration = $$props.duration);
    		if ('infinite' in $$props) $$invalidate(4, infinite = $$props.infinite);
    		if ('delay' in $$props) $$invalidate(5, delay = $$props.delay);
    		if ('colorRange' in $$props) $$invalidate(15, colorRange = $$props.colorRange);
    		if ('colorArray' in $$props) $$invalidate(16, colorArray = $$props.colorArray);
    		if ('amount' in $$props) $$invalidate(6, amount = $$props.amount);
    		if ('iterationCount' in $$props) $$invalidate(7, iterationCount = $$props.iterationCount);
    		if ('fallDistance' in $$props) $$invalidate(8, fallDistance = $$props.fallDistance);
    		if ('rounded' in $$props) $$invalidate(9, rounded = $$props.rounded);
    		if ('cone' in $$props) $$invalidate(10, cone = $$props.cone);
    		if ('noGravity' in $$props) $$invalidate(11, noGravity = $$props.noGravity);
    		if ('xSpread' in $$props) $$invalidate(12, xSpread = $$props.xSpread);
    		if ('destroyOnComplete' in $$props) $$invalidate(17, destroyOnComplete = $$props.destroyOnComplete);
    		if ('complete' in $$props) $$invalidate(13, complete = $$props.complete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		size,
    		x,
    		y,
    		duration,
    		infinite,
    		delay,
    		amount,
    		iterationCount,
    		fallDistance,
    		rounded,
    		cone,
    		noGravity,
    		xSpread,
    		complete,
    		getColor,
    		colorRange,
    		colorArray,
    		destroyOnComplete
    	];
    }

    class Confetti extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			size: 0,
    			x: 1,
    			y: 2,
    			duration: 3,
    			infinite: 4,
    			delay: 5,
    			colorRange: 15,
    			colorArray: 16,
    			amount: 6,
    			iterationCount: 7,
    			fallDistance: 8,
    			rounded: 9,
    			cone: 10,
    			noGravity: 11,
    			xSpread: 12,
    			destroyOnComplete: 17
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confetti",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get size() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get infinite() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set infinite(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorRange() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorRange(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colorArray() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colorArray(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get amount() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set amount(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get iterationCount() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set iterationCount(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fallDistance() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fallDistance(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rounded() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rounded(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get cone() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cone(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noGravity() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noGravity(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xSpread() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xSpread(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get destroyOnComplete() {
    		throw new Error("<Confetti>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set destroyOnComplete(value) {
    		throw new Error("<Confetti>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Card.svelte generated by Svelte v3.58.0 */

    const { console: console_1$4 } = globals;
    const file$b = "src\\components\\Card.svelte";

    function create_fragment$d(ctx) {
    	let div1;
    	let div0;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[11].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "card svelte-1t8rfxm");
    			toggle_class(div0, "card-tadaa", /*mounted*/ ctx[1]);
    			add_location(div0, file$b, 107, 8, 2951);
    			attr_dev(div1, "class", "card-container svelte-1t8rfxm");
    			add_location(div1, file$b, 106, 4, 2913);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[12](div0);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*mounted*/ 2) {
    				toggle_class(div0, "card-tadaa", /*mounted*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getBeerPong() {
    	return this.getPage('BeerPongPage').getBeerPong();
    }

    function onTap() {
    	
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['default']);
    	let card;
    	let { pages = [] } = $$props;
    	let openPages = [];
    	let activePage;
    	let mounted = false;
    	let activeIndex = 0;
    	let flappyBird;
    	let changeAllowed = true;

    	onMount(() => {
    		console.debug("App mounted");

    		// get svelte child instances from slot
    		$$invalidate(2, pages = [...card.children]);

    		$$invalidate(1, mounted = true);
    	});

    	function nextPage() {
    		if (!changeAllowed) return;

    		if (activeIndex < pages.length - 1) {
    			changeAllowed = false;

    			// rotate page to the left
    			activePage.getPage().next();

    			activeIndex++;
    			activePage = pages[activeIndex];
    			activePage.getPage().setContentVisible();

    			setTimeout(
    				() => {
    					openPages.push(activePage);
    					console.log(openPages);
    					sortPages();
    					changeAllowed = true;
    				},
    				750
    			);
    		}
    	}

    	function prevPage() {
    		if (!changeAllowed) return;

    		if (activeIndex > 0) {
    			changeAllowed = false;

    			// rotate page to the right
    			activeIndex--;

    			activePage = pages[activeIndex];
    			activePage.getPage().prev();
    			activePage.getPage().setContentVisible();

    			setTimeout(
    				() => {
    					openPages.pop();
    					sortPages();
    					console.log(openPages);
    					changeAllowed = true;
    				},
    				750
    			);
    		}
    	}

    	function create(cls) {
    		pages.push(new cls({ target: card }));

    		pages.forEach((page, index) => {
    			page.getPage().setZIndex(pages.length - index);
    		});

    		activePage = pages[activeIndex];

    		// activePage.getPage().setContentVisible();
    		return this;
    	}

    	function ready() {
    		activePage = pages[activeIndex];
    		activePage.getPage().setContentVisible();
    		activePage.getPage().setCover();
    		sortPages();
    		flappyBird = getPage('FlappyBirdPage');
    		return this;
    	}

    	function getPage(name) {
    		let page;

    		pages.forEach(p => {
    			if (p.constructor.name === name) {
    				page = p;
    			}
    		});

    		return page;
    	} // return pages.find(page => page.constructor.name === name)[0];

    	function sortOpenPagesZIndex() {
    		return;
    	}

    	function sortPages() {
    		openPages.forEach((page, index) => {
    			page.getPage().setZIndex(pages.length - index);
    		});

    		// sort closed pages
    		pages.forEach((page, index) => {
    			if (!openPages.includes(page)) {
    				page.getPage().setZIndex(pages.length - index);
    			}
    		});
    	}

    	const writable_props = ['pages'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$4.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			card = $$value;
    			$$invalidate(0, card);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('pages' in $$props) $$invalidate(2, pages = $$props.pages);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Confetti,
    		card,
    		pages,
    		openPages,
    		activePage,
    		mounted,
    		activeIndex,
    		flappyBird,
    		changeAllowed,
    		nextPage,
    		prevPage,
    		create,
    		ready,
    		getPage,
    		getBeerPong,
    		sortOpenPagesZIndex,
    		sortPages,
    		onTap
    	});

    	$$self.$inject_state = $$props => {
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    		if ('pages' in $$props) $$invalidate(2, pages = $$props.pages);
    		if ('openPages' in $$props) openPages = $$props.openPages;
    		if ('activePage' in $$props) activePage = $$props.activePage;
    		if ('mounted' in $$props) $$invalidate(1, mounted = $$props.mounted);
    		if ('activeIndex' in $$props) activeIndex = $$props.activeIndex;
    		if ('flappyBird' in $$props) flappyBird = $$props.flappyBird;
    		if ('changeAllowed' in $$props) changeAllowed = $$props.changeAllowed;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		card,
    		mounted,
    		pages,
    		nextPage,
    		prevPage,
    		create,
    		ready,
    		getPage,
    		getBeerPong,
    		onTap,
    		$$scope,
    		slots,
    		div0_binding
    	];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			pages: 2,
    			nextPage: 3,
    			prevPage: 4,
    			create: 5,
    			ready: 6,
    			getPage: 7,
    			getBeerPong: 8,
    			onTap: 9
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get pages() {
    		throw new Error("<Card>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pages(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nextPage() {
    		return this.$$.ctx[3];
    	}

    	set nextPage(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prevPage() {
    		return this.$$.ctx[4];
    	}

    	set prevPage(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get create() {
    		return this.$$.ctx[5];
    	}

    	set create(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ready() {
    		return this.$$.ctx[6];
    	}

    	set ready(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getPage() {
    		return this.$$.ctx[7];
    	}

    	set getPage(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getBeerPong() {
    		return getBeerPong;
    	}

    	set getBeerPong(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onTap() {
    		return onTap;
    	}

    	set onTap(value) {
    		throw new Error("<Card>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // import { Position } from "./Swipe.ts"; // import type to avoid circular dependency
    var ThrowRange;
    (function (ThrowRange) {
        ThrowRange[ThrowRange["TooShort"] = 0] = "TooShort";
        ThrowRange[ThrowRange["Short"] = 1] = "Short";
        ThrowRange[ThrowRange["Medium"] = 2] = "Medium";
        ThrowRange[ThrowRange["Long"] = 3] = "Long";
        ThrowRange[ThrowRange["TooLong"] = 4] = "TooLong";
    })(ThrowRange || (ThrowRange = {}));
    var ThrowAngle;
    (function (ThrowAngle) {
        ThrowAngle[ThrowAngle["TooLeft"] = 0] = "TooLeft";
        ThrowAngle[ThrowAngle["Left"] = 1] = "Left";
        ThrowAngle[ThrowAngle["StraightLeft"] = 2] = "StraightLeft";
        ThrowAngle[ThrowAngle["Straight"] = 3] = "Straight";
        ThrowAngle[ThrowAngle["StraightRight"] = 4] = "StraightRight";
        ThrowAngle[ThrowAngle["Right"] = 5] = "Right";
        ThrowAngle[ThrowAngle["TooRight"] = 6] = "TooRight";
    })(ThrowAngle || (ThrowAngle = {}));
    class BeerPongCalculator {
        static determineThrowRange(pos1, pos2) {
            const distance = BeerPongCalculator.calculateDistance(pos1, pos2);
            if (distance < 100) {
                return ThrowRange.TooShort;
            }
            if (distance < 200) {
                return ThrowRange.Short;
            }
            if (distance < 300) {
                return ThrowRange.Medium;
            }
            if (distance < 400) {
                return ThrowRange.Long;
            }
            return ThrowRange.TooLong;
        }
        static determineThrowAngle(pos1, pos2) {
            const angle = BeerPongCalculator.calculateAngle(pos1, pos2);
            if (angle < -60) {
                return ThrowAngle.TooLeft;
            }
            if (angle < -30) {
                return ThrowAngle.Left;
            }
            if (angle < -10) {
                return ThrowAngle.StraightLeft;
            }
            if (angle < 10) {
                return ThrowAngle.Straight;
            }
            if (angle < 30) {
                return ThrowAngle.StraightRight;
            }
            if (angle < 60) {
                return ThrowAngle.Right;
            }
            return ThrowAngle.TooRight;
        }
        static calculateDistance(pos1, pos2) {
            const x = pos1.x - pos2.x;
            const y = pos1.y - pos2.y;
            return Math.sqrt(x * x + y * y);
        }
        static calculateAngle(pos1, pos2) {
            const x = pos1.x - pos2.x;
            const y = pos1.y - pos2.y;
            return Math.atan2(y, x) * 180 / Math.PI;
        }
        // there are 5 cups, ordered in a pyramid, 1 in the first row, 2 in the second row and three in the last row
        // check with angle and distance to determine which cup was hit
        static determineCupHit(pos1, pos2) {
            BeerPongCalculator.calculateAngle(pos1, pos2);
            const throwAngle = BeerPongCalculator.determineThrowAngle(pos1, pos2);
            console.log(ThrowAngle[throwAngle]);
            BeerPongCalculator.calculateDistance(pos1, pos2);
            const throwRange = BeerPongCalculator.determineThrowRange(pos1, pos2);
            console.log(ThrowRange[throwRange]);
            if (throwAngle === ThrowAngle.TooLeft || throwAngle === ThrowAngle.TooRight) {
                return 0;
            }
            if (throwRange === ThrowRange.TooShort) {
                return 0;
            }
            if (throwRange === ThrowRange.TooLong) {
                return 5;
            }
            if (throwRange === ThrowRange.Long) {
                if (throwAngle === ThrowAngle.Left || throwAngle === ThrowAngle.Right) {
                    return 5;
                }
                if (throwAngle === ThrowAngle.StraightLeft || throwAngle === ThrowAngle.StraightRight) {
                    return 4;
                }
                return 3;
            }
            if (throwRange === ThrowRange.Medium) {
                if (throwAngle === ThrowAngle.Left || throwAngle === ThrowAngle.Right) {
                    return 4;
                }
                if (throwAngle === ThrowAngle.StraightLeft || throwAngle === ThrowAngle.StraightRight) {
                    return 3;
                }
                return 2;
            }
            if (throwRange === ThrowRange.Short) {
                if (throwAngle === ThrowAngle.Left || throwAngle === ThrowAngle.Right) {
                    return 3;
                }
                if (throwAngle === ThrowAngle.StraightLeft || throwAngle === ThrowAngle.StraightRight) {
                    return 2;
                }
                return 1;
            }
            return 0;
        }
    }

    /* src\components\SwipeHint.svelte generated by Svelte v3.58.0 */

    const file$a = "src\\components\\SwipeHint.svelte";

    function create_fragment$c(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			div0.textContent = "<";
    			attr_dev(div0, "class", "arrow svelte-1tlm00a");
    			add_location(div0, file$a, 4, 8, 135);
    			attr_dev(div1, "class", "wrapper svelte-1tlm00a");
    			add_location(div1, file$a, 3, 4, 104);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SwipeHint', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SwipeHint> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class SwipeHint extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SwipeHint",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\components\Page.svelte generated by Svelte v3.58.0 */

    const { console: console_1$3 } = globals;
    const file$9 = "src\\components\\Page.svelte";

    function create_fragment$b(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[15].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[14], null);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "flip-card-back svelte-1xlc3yn");
    			add_location(div0, file$9, 59, 6, 1536);
    			attr_dev(div1, "class", "flip-card-front svelte-1xlc3yn");
    			add_location(div1, file$9, 60, 6, 1595);
    			attr_dev(div2, "class", "flip-card-inner svelte-1xlc3yn");
    			toggle_class(div2, "open", /*open*/ ctx[2]);
    			toggle_class(div2, "closed", /*closed*/ ctx[3]);
    			add_location(div2, file$9, 58, 4, 1475);
    			attr_dev(div3, "class", "flip-card svelte-1xlc3yn");
    			toggle_class(div3, "cover", /*cover*/ ctx[0]);
    			toggle_class(div3, "page", !/*cover*/ ctx[0]);
    			toggle_class(div3, "contentLoaded", !/*contentLoad*/ ctx[4]);
    			add_location(div3, file$9, 51, 2, 1333);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			/*div0_binding*/ ctx[16](div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			/*div1_binding*/ ctx[17](div1);
    			/*div3_binding*/ ctx[18](div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16384)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[14],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[14])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[14], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*open*/ 4) {
    				toggle_class(div2, "open", /*open*/ ctx[2]);
    			}

    			if (!current || dirty & /*closed*/ 8) {
    				toggle_class(div2, "closed", /*closed*/ ctx[3]);
    			}

    			if (!current || dirty & /*cover*/ 1) {
    				toggle_class(div3, "cover", /*cover*/ ctx[0]);
    			}

    			if (!current || dirty & /*cover*/ 1) {
    				toggle_class(div3, "page", !/*cover*/ ctx[0]);
    			}

    			if (!current || dirty & /*contentLoad*/ 16) {
    				toggle_class(div3, "contentLoaded", !/*contentLoad*/ ctx[4]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*div0_binding*/ ctx[16](null);
    			if (default_slot) default_slot.d(detaching);
    			/*div1_binding*/ ctx[17](null);
    			/*div3_binding*/ ctx[18](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Page', slots, ['default']);
    	const dispatch = createEventDispatcher();
    	let page;
    	let open = false;
    	let closed = false;
    	let contentLoad = false;
    	let cardBack;
    	let cardFront;
    	let { cover = false } = $$props;

    	function openPage(angle, time) {
    		$$invalidate(1, page.style.transform = `rotateY(${angle}deg)`, page);
    		$$invalidate(1, page.style.transition = `transform ${time}s`, page);
    	}

    	function setZIndex(zIndex) {
    		$$invalidate(1, page.style.zIndex = zIndex, page);
    	}

    	function next() {
    		$$invalidate(3, closed = false);
    		$$invalidate(2, open = true);
    		dispatch('opened');

    		setTimeout(
    			() => {
    				
    			},
    			1000 * (1.5 / 2)
    		); // cardBack.style.zIndex = 5;
    		// cardFront.style.zIndex = cardBack.style.zIndex - 1;
    		// cardBack.style.zIndex = 5;
    		// cardFront.style.zIndex = cardBack.style.zIndex - 1;

    		console.log("next");
    	} // setZIndex(-50);

    	function prev() {
    		$$invalidate(2, open = false);
    		$$invalidate(3, closed = true);

    		setTimeout(
    			() => {
    				
    			},
    			1000 * (1.5 / 2)
    		); // cardFront.style.zIndex = 5;
    		// cardBack.style.zIndex = cardFront.style.zIndex - 1;
    		// cardFront.style.zIndex = 5;
    		// cardBack.style.zIndex = cardFront.style.zIndex - 1;

    		console.log("prev");
    	} // setZIndex(50);

    	function setCover() {
    		$$invalidate(0, cover = true);
    	}

    	function setContentVisible() {
    		$$invalidate(4, contentLoad = true);
    	}

    	function isOpen() {
    		return open;
    	}

    	const writable_props = ['cover'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cardBack = $$value;
    			$$invalidate(5, cardBack);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			cardFront = $$value;
    			$$invalidate(6, cardFront);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			page = $$value;
    			$$invalidate(1, page);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('cover' in $$props) $$invalidate(0, cover = $$props.cover);
    		if ('$$scope' in $$props) $$invalidate(14, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		dispatch,
    		page,
    		open,
    		closed,
    		contentLoad,
    		cardBack,
    		cardFront,
    		cover,
    		openPage,
    		setZIndex,
    		next,
    		prev,
    		setCover,
    		setContentVisible,
    		isOpen
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    		if ('open' in $$props) $$invalidate(2, open = $$props.open);
    		if ('closed' in $$props) $$invalidate(3, closed = $$props.closed);
    		if ('contentLoad' in $$props) $$invalidate(4, contentLoad = $$props.contentLoad);
    		if ('cardBack' in $$props) $$invalidate(5, cardBack = $$props.cardBack);
    		if ('cardFront' in $$props) $$invalidate(6, cardFront = $$props.cardFront);
    		if ('cover' in $$props) $$invalidate(0, cover = $$props.cover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cover,
    		page,
    		open,
    		closed,
    		contentLoad,
    		cardBack,
    		cardFront,
    		openPage,
    		setZIndex,
    		next,
    		prev,
    		setCover,
    		setContentVisible,
    		isOpen,
    		$$scope,
    		slots,
    		div0_binding,
    		div1_binding,
    		div3_binding
    	];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {
    			cover: 0,
    			openPage: 7,
    			setZIndex: 8,
    			next: 9,
    			prev: 10,
    			setCover: 11,
    			setContentVisible: 12,
    			isOpen: 13
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get cover() {
    		throw new Error("<Page>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cover(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get openPage() {
    		return this.$$.ctx[7];
    	}

    	set openPage(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setZIndex() {
    		return this.$$.ctx[8];
    	}

    	set setZIndex(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get next() {
    		return this.$$.ctx[9];
    	}

    	set next(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prev() {
    		return this.$$.ctx[10];
    	}

    	set prev(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setCover() {
    		return this.$$.ctx[11];
    	}

    	set setCover(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContentVisible() {
    		return this.$$.ctx[12];
    	}

    	set setContentVisible(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isOpen() {
    		return this.$$.ctx[13];
    	}

    	set isOpen(value) {
    		throw new Error("<Page>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\BirthdayCake\BirthdayCake.svelte generated by Svelte v3.58.0 */

    const { console: console_1$2 } = globals;
    const file$8 = "src\\components\\BirthdayCake\\BirthdayCake.svelte";

    function create_fragment$a(ctx) {
    	let div;
    	let candle0;
    	let t0;
    	let candle1;
    	let t1;
    	let candle2;
    	let t2;
    	let candle3;
    	let current;

    	candle0 = new Candle({
    			props: { x: "20", y: "5" },
    			$$inline: true
    		});

    	candle0.$on("blowed", /*onBlowCandle*/ ctx[1]);

    	candle1 = new Candle({
    			props: { x: "40", y: "5" },
    			$$inline: true
    		});

    	candle1.$on("blowed", /*onBlowCandle*/ ctx[1]);

    	candle2 = new Candle({
    			props: { x: "60", y: "5" },
    			$$inline: true
    		});

    	candle2.$on("blowed", /*onBlowCandle*/ ctx[1]);

    	candle3 = new Candle({
    			props: { x: "80", y: "5" },
    			$$inline: true
    		});

    	candle3.$on("blowed", /*onBlowCandle*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(candle0.$$.fragment);
    			t0 = space();
    			create_component(candle1.$$.fragment);
    			t1 = space();
    			create_component(candle2.$$.fragment);
    			t2 = space();
    			create_component(candle3.$$.fragment);
    			attr_dev(div, "class", "candle-wrapper svelte-jie8ep");
    			add_location(div, file$8, 21, 4, 477);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(candle0, div, null);
    			append_dev(div, t0);
    			mount_component(candle1, div, null);
    			append_dev(div, t1);
    			mount_component(candle2, div, null);
    			append_dev(div, t2);
    			mount_component(candle3, div, null);
    			/*div_binding*/ ctx[2](div);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(candle0.$$.fragment, local);
    			transition_in(candle1.$$.fragment, local);
    			transition_in(candle2.$$.fragment, local);
    			transition_in(candle3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(candle0.$$.fragment, local);
    			transition_out(candle1.$$.fragment, local);
    			transition_out(candle2.$$.fragment, local);
    			transition_out(candle3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(candle0);
    			destroy_component(candle1);
    			destroy_component(candle2);
    			destroy_component(candle3);
    			/*div_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BirthdayCake', slots, []);
    	let candleWrapper;
    	let amountOfCandles;

    	onMount(() => {
    		amountOfCandles = candleWrapper.children.length;
    		console.debug("BirthdayCake mounted");
    	});

    	function onBlowCandle() {
    		console.count("blow");
    		amountOfCandles--;
    		checkReady();
    	}

    	function checkReady() {
    		if (amountOfCandles == 0) {
    			alert("Happy Birthday!");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<BirthdayCake> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			candleWrapper = $$value;
    			$$invalidate(0, candleWrapper);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Candle,
    		candleWrapper,
    		amountOfCandles,
    		onBlowCandle,
    		checkReady
    	});

    	$$self.$inject_state = $$props => {
    		if ('candleWrapper' in $$props) $$invalidate(0, candleWrapper = $$props.candleWrapper);
    		if ('amountOfCandles' in $$props) amountOfCandles = $$props.amountOfCandles;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [candleWrapper, onBlowCandle, div_binding];
    }

    class BirthdayCake extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BirthdayCake",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\components\Pages\BirthdayCakePage.svelte generated by Svelte v3.58.0 */

    // (10:4) <Page bind:this={page}>
    function create_default_slot$7(ctx) {
    	let birthdaycake;
    	let current;
    	birthdaycake = new BirthdayCake({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(birthdaycake.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(birthdaycake, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(birthdaycake.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(birthdaycake.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(birthdaycake, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$7.name,
    		type: "slot",
    		source: "(10:4) <Page bind:this={page}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let page_1;
    	let current;

    	let page_1_props = {
    		$$slots: { default: [create_default_slot$7] },
    		$$scope: { ctx }
    	};

    	page_1 = new Page({ props: page_1_props, $$inline: true });
    	/*page_1_binding*/ ctx[2](page_1);

    	const block = {
    		c: function create() {
    			create_component(page_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				page_1_changes.$$scope = { dirty, ctx };
    			}

    			page_1.$set(page_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*page_1_binding*/ ctx[2](null);
    			destroy_component(page_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BirthdayCakePage', slots, []);
    	let page;

    	function getPage() {
    		return page;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BirthdayCakePage> was created with unknown prop '${key}'`);
    	});

    	function page_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			page = $$value;
    			$$invalidate(0, page);
    		});
    	}

    	$$self.$capture_state = () => ({ Page, BirthdayCake, page, getPage });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, getPage, page_1_binding];
    }

    class BirthdayCakePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { getPage: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BirthdayCakePage",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get getPage() {
    		return this.$$.ctx[1];
    	}

    	set getPage(value) {
    		throw new Error("<BirthdayCakePage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pages\GreetingsPage.svelte generated by Svelte v3.58.0 */
    const file$7 = "src\\components\\Pages\\GreetingsPage.svelte";

    // (9:4) <Page bind:this={page}>
    function create_default_slot$6(ctx) {
    	let div;
    	let p;
    	let t1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			p.textContent = "Alles alles liebe zu deinem Geburtstag! Hab einen ganz doll schönen Tag!";
    			t1 = space();
    			img = element("img");
    			attr_dev(p, "class", "animate__bounce svelte-1j37s4n");
    			add_location(p, file$7, 10, 10, 202);
    			if (!src_url_equal(img.src, img_src_value = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjFlOTM5ZDBiMjhjZDcyMTc2M2NiODYyOWQwYmVhOGU0NTJlOThhZSZjdD1z/cCOVfFwDI3awdse5A3/giphy.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1j37s4n");
    			add_location(img, file$7, 14, 8, 372);
    			attr_dev(div, "class", "greetings svelte-1j37s4n");
    			add_location(div, file$7, 9, 8, 167);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t1);
    			append_dev(div, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$6.name,
    		type: "slot",
    		source: "(9:4) <Page bind:this={page}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let page_1;
    	let current;

    	let page_1_props = {
    		$$slots: { default: [create_default_slot$6] },
    		$$scope: { ctx }
    	};

    	page_1 = new Page({ props: page_1_props, $$inline: true });
    	/*page_1_binding*/ ctx[2](page_1);

    	const block = {
    		c: function create() {
    			create_component(page_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				page_1_changes.$$scope = { dirty, ctx };
    			}

    			page_1.$set(page_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*page_1_binding*/ ctx[2](null);
    			destroy_component(page_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GreetingsPage', slots, []);
    	let page;

    	function getPage() {
    		return page;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<GreetingsPage> was created with unknown prop '${key}'`);
    	});

    	function page_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			page = $$value;
    			$$invalidate(0, page);
    		});
    	}

    	$$self.$capture_state = () => ({ Page, page, getPage });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, getPage, page_1_binding];
    }

    class GreetingsPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { getPage: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GreetingsPage",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get getPage() {
    		return this.$$.ctx[1];
    	}

    	set getPage(value) {
    		throw new Error("<GreetingsPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pages\CoverPage.svelte generated by Svelte v3.58.0 */
    const file$6 = "src\\components\\Pages\\CoverPage.svelte";

    // (9:2) <Page bind:this={page}>
    function create_default_slot$5(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Happy Birthday Milena!";
    			t1 = space();
    			img = element("img");
    			attr_dev(h1, "class", "animate__bounce svelte-w2djc4");
    			add_location(h1, file$6, 10, 6, 192);
    			if (!src_url_equal(img.src, img_src_value = "https://i.giphy.com/media/o85Cv5m1TX9OQvKS44/giphy.webp")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-w2djc4");
    			add_location(img, file$6, 14, 6, 300);
    			attr_dev(div, "class", "greetings svelte-w2djc4");
    			add_location(div, file$6, 9, 4, 161);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$5.name,
    		type: "slot",
    		source: "(9:2) <Page bind:this={page}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let page_1;
    	let current;

    	let page_1_props = {
    		$$slots: { default: [create_default_slot$5] },
    		$$scope: { ctx }
    	};

    	page_1 = new Page({ props: page_1_props, $$inline: true });
    	/*page_1_binding*/ ctx[2](page_1);

    	const block = {
    		c: function create() {
    			create_component(page_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				page_1_changes.$$scope = { dirty, ctx };
    			}

    			page_1.$set(page_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*page_1_binding*/ ctx[2](null);
    			destroy_component(page_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CoverPage', slots, []);
    	let page;

    	function getPage() {
    		return page;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CoverPage> was created with unknown prop '${key}'`);
    	});

    	function page_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			page = $$value;
    			$$invalidate(0, page);
    		});
    	}

    	$$self.$capture_state = () => ({ Page, page, getPage });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, getPage, page_1_binding];
    }

    class CoverPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { getPage: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CoverPage",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get getPage() {
    		return this.$$.ctx[1];
    	}

    	set getPage(value) {
    		throw new Error("<CoverPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pages\SecretLastPage.svelte generated by Svelte v3.58.0 */
    const file$5 = "src\\components\\Pages\\SecretLastPage.svelte";

    // (9:4) <Page bind:this={page}>
    function create_default_slot$4(ctx) {
    	let p;
    	let t1;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Psst... you shouldn't be here... Secret last Page";
    			t1 = space();
    			img = element("img");
    			attr_dev(p, "class", "svelte-7kq3bj");
    			add_location(p, file$5, 10, 8, 169);
    			if (!src_url_equal(img.src, img_src_value = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGU4Y2UyNWFhNjcxOTIyMzJmNDQ5NGUxNzc3YmFkNWY0Y2ExNGYwNyZjdD1z/pyQe5pBkyOY3IMONmz/giphy.gif")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "ducky the happy duck");
    			attr_dev(img, "class", "svelte-7kq3bj");
    			add_location(img, file$5, 12, 8, 399);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$4.name,
    		type: "slot",
    		source: "(9:4) <Page bind:this={page}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let page_1;
    	let current;

    	let page_1_props = {
    		$$slots: { default: [create_default_slot$4] },
    		$$scope: { ctx }
    	};

    	page_1 = new Page({ props: page_1_props, $$inline: true });
    	/*page_1_binding*/ ctx[2](page_1);

    	const block = {
    		c: function create() {
    			create_component(page_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				page_1_changes.$$scope = { dirty, ctx };
    			}

    			page_1.$set(page_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*page_1_binding*/ ctx[2](null);
    			destroy_component(page_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SecretLastPage', slots, []);
    	let page;

    	function getPage() {
    		return page;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SecretLastPage> was created with unknown prop '${key}'`);
    	});

    	function page_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			page = $$value;
    			$$invalidate(0, page);
    		});
    	}

    	$$self.$capture_state = () => ({ Page, page, getPage });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, getPage, page_1_binding];
    }

    class SecretLastPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { getPage: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SecretLastPage",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get getPage() {
    		return this.$$.ctx[1];
    	}

    	set getPage(value) {
    		throw new Error("<SecretLastPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pages\ImagesPage.svelte generated by Svelte v3.58.0 */
    const file$4 = "src\\components\\Pages\\ImagesPage.svelte";

    // (9:4) <Page bind:this={page}>
    function create_default_slot$3(ctx) {
    	let img0;
    	let img0_src_value;
    	let t;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			img0 = element("img");
    			t = space();
    			img1 = element("img");
    			attr_dev(img0, "class", "image1 svelte-1ikw0td");
    			if (!src_url_equal(img0.src, img0_src_value = "https://i.giphy.com/media/73trcfdnqJmrftTy7i/giphy.webp")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "image");
    			add_location(img0, file$4, 10, 8, 169);
    			attr_dev(img1, "class", "image2 svelte-1ikw0td");
    			if (!src_url_equal(img1.src, img1_src_value = "https://i.giphy.com/media/1Sdsv0B6CigZtDod8I/giphy.webp")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "image");
    			add_location(img1, file$4, 11, 8, 275);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img0, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img1, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img0);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(9:4) <Page bind:this={page}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let page_1;
    	let current;

    	let page_1_props = {
    		$$slots: { default: [create_default_slot$3] },
    		$$scope: { ctx }
    	};

    	page_1 = new Page({ props: page_1_props, $$inline: true });
    	/*page_1_binding*/ ctx[2](page_1);

    	const block = {
    		c: function create() {
    			create_component(page_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				page_1_changes.$$scope = { dirty, ctx };
    			}

    			page_1.$set(page_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*page_1_binding*/ ctx[2](null);
    			destroy_component(page_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ImagesPage', slots, []);
    	let page;

    	function getPage() {
    		return page;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ImagesPage> was created with unknown prop '${key}'`);
    	});

    	function page_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			page = $$value;
    			$$invalidate(0, page);
    		});
    	}

    	$$self.$capture_state = () => ({ Page, page, getPage });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, getPage, page_1_binding];
    }

    class ImagesPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { getPage: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ImagesPage",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get getPage() {
    		return this.$$.ctx[1];
    	}

    	set getPage(value) {
    		throw new Error("<ImagesPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Games\FlappyBird.svelte generated by Svelte v3.58.0 */

    const { console: console_1$1 } = globals;
    const file$3 = "src\\components\\Games\\FlappyBird.svelte";

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let canvas_1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "id", "canvas");
    			attr_dev(canvas_1, "width", "400");
    			attr_dev(canvas_1, "height", "600");
    			attr_dev(canvas_1, "class", "svelte-1y5v92y");
    			add_location(canvas_1, file$3, 461, 12, 15531);
    			attr_dev(div0, "class", "game svelte-1y5v92y");
    			add_location(div0, file$3, 460, 8, 15499);
    			attr_dev(div1, "class", "game-wrapper svelte-1y5v92y");
    			add_location(div1, file$3, 459, 4, 15463);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, canvas_1);
    			/*canvas_1_binding*/ ctx[2](canvas_1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*canvas_1_binding*/ ctx[2](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function clamp(value, min, max) {
    	return Math.min(Math.max(value, min), max);
    }

    // get the high score from storage
    function getHighScore() {
    	// get the high score from storage
    	let highScore = parseFloat(localStorage.getItem('highScore'));

    	// if there is no high score
    	if (highScore === null) {
    		// set the high score to 0
    		highScore = 0;
    	}

    	// return the high score
    	return highScore;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FlappyBird', slots, []);
    	const dispatch = createEventDispatcher();

    	// The canvas element
    	let canvas;

    	// The canvas context
    	let ctx;

    	// The game loop
    	let gameLoop;

    	let bgImage;
    	let bg;
    	let birdSprite;
    	let pipeSprite;
    	let collectableSprite;

    	// The bird
    	let bird;

    	// The pipes
    	let pipes = [];

    	// the collectables
    	let collectables = [];

    	// The score
    	let score = 0;

    	let highScore = 0;
    	highScore = getHighScore();

    	// The game states
    	var GameState;

    	(function (GameState) {
    		GameState[GameState["Start"] = 0] = "Start";
    		GameState[GameState["Playing"] = 1] = "Playing";
    		GameState[GameState["GameOver"] = 2] = "GameOver";
    	})(GameState || (GameState = {}));

    	// The game state
    	let gameState = GameState.Start;

    	onMount(() => {
    		// Get the canvas context
    		ctx = canvas.getContext('2d');

    		// Create the bird
    		bird = new Bird();

    		// Start the game loop
    		gameLoop = window.setInterval(update, 1000 / 60);

    		bgImage = new Image();
    		bgImage.src = 'https://static.vecteezy.com/system/resources/thumbnails/009/877/673/small_2x/pixel-art-sky-background-with-clouds-cloudy-blue-sky-for-8bit-game-on-white-background-vector.jpg';
    		bg = new Background(bgImage, 1600, canvas.height, 0.5);

    		// Call the loop method
    		loop();
    	});

    	// paralex scrolling background
    	class Background {
    		// The background constructor
    		constructor(image, width, height, speed) {
    			this.image = image;
    			this.width = width;
    			this.height = height;
    			this.speed = speed;
    			this.x = 0;
    			this.y = 0;
    		}

    		// The background's update method
    		update() {
    			this.x -= this.speed;

    			if (this.x <= -this.width) {
    				this.x = 0;
    			}
    		}

    		// The background's draw method
    		draw() {
    			ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    			ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    		}
    	}

    	class Sprite {
    		// The sprite loader constructor
    		constructor(image, width, height) {
    			this.image = image;
    			this.width = width;
    			this.height = height;
    		}

    		// The sprite loader's draw method
    		draw(x, y) {
    			ctx.drawImage(this.image, x, y, this.width, this.height);
    		}
    	}

    	// The bird
    	class Bird {
    		// The bird constructor
    		constructor() {
    			this.x = 50;
    			this.y = 50;
    			this.width = 20;
    			this.height = 20;
    			this.gravity = 0.15;
    			this.velocity = 0;
    			this.jumpForce = 5;
    			this.color = '#000000';
    		}

    		// The bird's update method
    		update() {
    			// Update the bird's velocity
    			this.velocity += this.gravity;

    			// Update the bird's y position
    			this.y += this.velocity;

    			// If the bird's y position is greater than the canvas height
    			if (this.y + this.height > canvas.height) {
    				// Set the bird's y position to the canvas height
    				this.y = canvas.height - this.height;

    				// Set the bird's velocity to 0
    				this.velocity = 0;
    			}

    			// If the bird's y position is less than 0
    			if (this.y < 0) {
    				// Set the bird's y position to 0
    				this.y = 0;

    				// Set the bird's velocity to 0
    				this.velocity = 0;
    			}
    		}

    		// The bird's draw method
    		draw() {
    			// Set the fill style to the bird's color
    			ctx.fillStyle = this.color;

    			// rotate depending on velocity
    			ctx.save();

    			ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    			ctx.rotate(this.velocity / 10);
    			ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

    			// draw the bird 
    			// draw bird
    			ctx.drawImage(birdSprite, this.x, this.y, this.width, this.height);

    			// ctx.fillRect(this.x, this.y, this.width, this.height);
    			ctx.restore();
    		} // Draw the bird

    		// The bird's jump method
    		jump() {
    			// Set the bird's velocity to the bird's jump force
    			this.velocity = -this.jumpForce;
    		}

    		static loadBirdSprite(url) {
    			return new Promise((resolve, reject) => {
    					birdSprite = new Image();
    					birdSprite.src = url;
    					birdSprite.onload = () => resolve();
    					birdSprite.onerror = () => reject();
    				});
    		}
    	}

    	// The pipe
    	class Pipe {
    		// The pipe constructor
    		constructor() {
    			// Set the pipe's x position to the canvas width
    			this.x = canvas.width;

    			// Set the pipe's y position to a random number between 0 and the canvas height
    			// ensure that the gap is always between top and bottom of canvas
    			// both pipes should always visible on the screen
    			this.y = clamp(Math.random() * (canvas.height - 150) + 75, 80, canvas.height - 100);

    			// Set the pipe's width to 50
    			this.width = 50;

    			// Set the pipe's height to 50
    			this.height = 50;

    			// Set the pipe's color to black
    			this.color = 'green';

    			// Set the pipe's gap to 100
    			this.gap = 150;

    			// Set the pipe's speed to 2
    			this.speed = 2;
    		}

    		// The pipe's update method
    		update() {
    			// Update the pipe's x position
    			this.x -= this.speed;

    			// If the pipe's x position is less than 0
    			if (this.x + this.width < 0) {
    				// Set the pipe's x position to the canvas width
    				this.x = canvas.width;

    				// Set the pipe's y position to a random number between 0 and the canvas height
    				this.y = Math.random() * canvas.height;
    			}
    		}

    		checkCollision(bird) {
    			// If the bird collides with the pipe
    			if (bird.x + bird.width > this.x && bird.x < this.x + this.width && (bird.y < this.y || bird.y + bird.height > this.y + this.gap)) {
    				// Set the game state to game over
    				gameState = GameState.GameOver;

    				saveScore();
    			}
    		}

    		// The pipe's draw method
    		draw() {
    			// draw the two pipes
    			ctx.fillStyle = this.color;

    			ctx.fillRect(this.x, 0, this.width, this.y);
    			ctx.fillRect(this.x, this.y + this.gap, this.width, canvas.height - this.y - this.gap);
    		}
    	}

    	Bird.loadBirdSprite('https://raw.githubusercontent.com/jpnqs/chrome-bunny-invasion/master/app/images/icon.png');

    	class Collectable {
    		// The collectable constructor
    		constructor() {
    			// Set the collectable's x position to the canvas width
    			this.x = canvas.width;

    			// Set the collectable's y position to a random number between 0 and the canvas height
    			this.y = Math.random() * canvas.height;

    			// Set the collectable's width to 50
    			this.width = 50;

    			// Set the collectable's height to 50
    			this.height = 50;

    			// Set the collectable's color to black
    			this.color = 'red';

    			// Set the collectable's speed to 2
    			this.speed = 2;
    		}

    		// The collectable's update method
    		update() {
    			// Update the collectable's x position
    			this.x -= this.speed;

    			// If the collectable's x position is less than 0
    			if (this.x + this.width < 0) {
    				// Set the collectable's x position to the canvas width
    				this.x = canvas.width;

    				// Set the collectable's y position to a random number between 0 and the canvas height
    				this.y = Math.random() * canvas.height;
    			}
    		}

    		checkCollision(bird) {
    			// If the bird collides with the collectable
    			if (bird.x + bird.width > this.x && bird.x < this.x + this.width && (bird.y < this.y || bird.y + bird.height > this.y + this.gap)) {
    				// Set the game state to game over
    				gameState = GameState.GameOver;

    				saveScore();
    			}
    		}

    		// The collectable's draw method
    		draw() {
    			// draw the collactable
    			ctx.fillStyle = this.color;

    			ctx.fillRect(this.x, 0, this.width, this.y);
    		}
    	}

    	// The game's update method
    	function update() {
    		// If the game state is playing
    		if (gameState === GameState.Playing) {
    			// Update the bird
    			bird.update();

    			bg.update();

    			// update collecatables
    			collectables.forEach(collectable => collectable.update());

    			// Update the pipes
    			pipes.forEach(pipe => pipe.update());

    			// If the bird collides with a pipe
    			if (pipes.some(pipe => bird.x + bird.width > pipe.x && bird.x < pipe.x + pipe.width && (bird.y < pipe.y || bird.y + bird.height > pipe.y + pipe.gap))) {
    				// Set the game state to game over
    				gameState = GameState.GameOver;

    				saveScore();
    			}

    			collectables.forEach(collectable => collectable.update());

    			// if the bird collides with a collectable
    			if (collectables.some(collectable => bird.x + bird.width > collectable.x && bird.x < collectable.x + collectable.width && (bird.y < collectable.y || bird.y + bird.height > collectable.y + collectable.gap))) {
    				// Set the game state to game over
    				// gameState = GameState.GameOver;
    				console.log("collided");
    			}

    			// If the bird collides with the ground
    			if (bird.y + bird.height > canvas.height) {
    				// Set the game state to game over
    				gameState = GameState.GameOver;

    				saveScore();
    			}

    			// If the bird collides with the ceiling
    			if (bird.y < 0) {
    				// Set the game state to game over
    				gameState = GameState.GameOver;

    				saveScore();
    			}

    			// If the bird passes a pipe
    			if (pipes.some(pipe => bird.x > pipe.x + pipe.width)) {
    				// Increment the score
    				score++;
    			}
    		}
    	}

    	// The game's draw method
    	function draw() {
    		// Clear the canvas
    		ctx.clearRect(0, 0, canvas.width, canvas.height);

    		// draw background
    		ctx.fillStyle = 'lightblue';

    		ctx.fillRect(0, 0, canvas.width, canvas.height);
    		bg.draw();

    		// If the game state is start
    		if (gameState === GameState.Start) {
    			// Set the fill style to black
    			ctx.fillStyle = 'white';

    			// Set the font
    			ctx.font = '30px Roboto';

    			// Draw the text
    			ctx.textAlign = 'center';

    			ctx.fillText('Tap to Start', canvas.width / 2, canvas.height / 2);
    		}

    		// If the game state is playing
    		if (gameState === GameState.Playing) {
    			// Draw the bird
    			bird.draw();

    			// Draw the pipes
    			pipes.forEach(pipe => pipe.draw());

    			// Set the fill style to black
    			ctx.fillStyle = 'white';

    			// Set the font
    			ctx.font = '30px Roboto';

    			ctx.textAlign = 'left';

    			// Draw the text
    			ctx.fillText('Score: ' + score, 100, 30, canvas.width);
    		}

    		// If the game state is game over
    		if (gameState === GameState.GameOver) {
    			// Set the fill style to black
    			ctx.fillStyle = 'white';

    			// Set the font
    			ctx.font = '30px Roboto';

    			// draw centered game over text and the current score
    			ctx.textAlign = 'center';

    			ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    			ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2);

    			// draw highscore
    			// draw succes message when highscore is topped
    			if (score > highScore) {
    				ctx.fillText('New Highscore!', canvas.width / 2, canvas.height / 2 + 25);
    			} else {
    				ctx.fillText('Highscore: ' + highScore, canvas.width / 2, canvas.height / 2 + 25);
    			}

    			ctx.fillText('Tap to Restart', canvas.width / 2, canvas.height / 2 + 50);
    		}
    	}

    	// The game's loop method
    	function loop() {
    		// Update the game
    		update();

    		// Draw the game
    		draw();

    		// Call the loop method again
    		requestAnimationFrame(loop);
    	}

    	// The game's start method
    	function start() {
    		highScore = getHighScore();

    		// Set the game state to playing
    		gameState = GameState.Playing;

    		// Set the score to 0
    		score = 0;

    		// Create a new bird
    		bird = new Bird();

    		// Create a new pipe
    		pipes = [new Pipe()];

    		generateCollecctables();
    	}

    	// The game's restart method
    	function restart() {
    		// Set the game state to start
    		gameState = GameState.Start;

    		// Set the score to 0
    		score = 0;

    		// Create a new bird
    		bird = new Bird();

    		// Create a new pipe
    		pipes = [new Pipe()];
    	}

    	function generateCollecctables() {
    		// Create a new collectable
    		collectables = [new Collectable()];
    	}

    	function tap() {
    		// If the game state is playing
    		if (gameState === GameState.Playing) {
    			// Jump the bird
    			bird.jump();
    		}

    		// If the game state is start
    		if (gameState === GameState.Start) {
    			// Start the game
    			start();
    		}

    		// If the game state is game over
    		if (gameState === GameState.GameOver) {
    			// Restart the game
    			restart();
    		}
    	}

    	// The game's key down method
    	function keyDown(e) {
    		// If the game state is playing
    		if (gameState === GameState.Playing) {
    			// If the key is space
    			if (e.key === ' ') {
    				// Jump the bird
    				bird.jump();
    			}
    		}

    		// If the game state is start
    		if (gameState === GameState.Start) {
    			// If the key is space
    			if (e.key === ' ') {
    				// Start the game
    				start();
    			}
    		}

    		// If the game state is game over
    		if (gameState === GameState.GameOver) {
    			// If the key is space
    			if (e.key === ' ') {
    				// Restart the game
    				restart();
    			}
    		}
    	}

    	// save score to storage
    	function saveScore() {
    		// get the current score
    		let currentScore = score;

    		let hScore = highScore;

    		// get the high score from storage
    		// if there is no high score
    		if (hScore === null) {
    			// set the high score to the current score
    			hScore = currentScore;
    		}

    		// if the current score is greater than the high score
    		if (currentScore > highScore) {
    			// set the high score to the current score
    			hScore = currentScore;
    		}

    		// save the high score to storage
    		localStorage.setItem('highScore', hScore.toString());
    	}

    	// Add the key down event listener
    	document.addEventListener('keydown', keyDown);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<FlappyBird> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		canvas,
    		ctx,
    		gameLoop,
    		bgImage,
    		bg,
    		birdSprite,
    		pipeSprite,
    		collectableSprite,
    		bird,
    		pipes,
    		collectables,
    		score,
    		highScore,
    		GameState,
    		gameState,
    		Background,
    		Sprite,
    		Bird,
    		Pipe,
    		Collectable,
    		update,
    		draw,
    		clamp,
    		loop,
    		start,
    		restart,
    		generateCollecctables,
    		tap,
    		keyDown,
    		saveScore,
    		getHighScore
    	});

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    		if ('ctx' in $$props) ctx = $$props.ctx;
    		if ('gameLoop' in $$props) gameLoop = $$props.gameLoop;
    		if ('bgImage' in $$props) bgImage = $$props.bgImage;
    		if ('bg' in $$props) bg = $$props.bg;
    		if ('birdSprite' in $$props) birdSprite = $$props.birdSprite;
    		if ('pipeSprite' in $$props) pipeSprite = $$props.pipeSprite;
    		if ('collectableSprite' in $$props) collectableSprite = $$props.collectableSprite;
    		if ('bird' in $$props) bird = $$props.bird;
    		if ('pipes' in $$props) pipes = $$props.pipes;
    		if ('collectables' in $$props) collectables = $$props.collectables;
    		if ('score' in $$props) score = $$props.score;
    		if ('highScore' in $$props) highScore = $$props.highScore;
    		if ('GameState' in $$props) GameState = $$props.GameState;
    		if ('gameState' in $$props) gameState = $$props.gameState;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canvas, tap, canvas_1_binding];
    }

    class FlappyBird extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { tap: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FlappyBird",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get tap() {
    		return this.$$.ctx[1];
    	}

    	set tap(value) {
    		throw new Error("<FlappyBird>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pages\FlappyBirdPage.svelte generated by Svelte v3.58.0 */

    // (14:4) <Page bind:this={page}>
    function create_default_slot$2(ctx) {
    	let flappybird;
    	let current;
    	let flappybird_props = {};
    	flappybird = new FlappyBird({ props: flappybird_props, $$inline: true });
    	/*flappybird_binding*/ ctx[4](flappybird);

    	const block = {
    		c: function create() {
    			create_component(flappybird.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(flappybird, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const flappybird_changes = {};
    			flappybird.$set(flappybird_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(flappybird.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(flappybird.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*flappybird_binding*/ ctx[4](null);
    			destroy_component(flappybird, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(14:4) <Page bind:this={page}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let page_1;
    	let current;

    	let page_1_props = {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	};

    	page_1 = new Page({ props: page_1_props, $$inline: true });
    	/*page_1_binding*/ ctx[5](page_1);

    	const block = {
    		c: function create() {
    			create_component(page_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_1_changes = {};

    			if (dirty & /*$$scope, flappyBird*/ 66) {
    				page_1_changes.$$scope = { dirty, ctx };
    			}

    			page_1.$set(page_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*page_1_binding*/ ctx[5](null);
    			destroy_component(page_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('FlappyBirdPage', slots, []);
    	let page;
    	let flappyBird;

    	function getPage() {
    		return page;
    	}

    	function onTap() {
    		flappyBird.tap();
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FlappyBirdPage> was created with unknown prop '${key}'`);
    	});

    	function flappybird_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			flappyBird = $$value;
    			$$invalidate(1, flappyBird);
    		});
    	}

    	function page_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			page = $$value;
    			$$invalidate(0, page);
    		});
    	}

    	$$self.$capture_state = () => ({
    		FlappyBird,
    		Page,
    		page,
    		flappyBird,
    		getPage,
    		onTap
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('flappyBird' in $$props) $$invalidate(1, flappyBird = $$props.flappyBird);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, flappyBird, getPage, onTap, flappybird_binding, page_1_binding];
    }

    class FlappyBirdPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { getPage: 2, onTap: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FlappyBirdPage",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get getPage() {
    		return this.$$.ctx[2];
    	}

    	set getPage(value) {
    		throw new Error("<FlappyBirdPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onTap() {
    		return this.$$.ctx[3];
    	}

    	set onTap(value) {
    		throw new Error("<FlappyBirdPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Games\BP.svelte generated by Svelte v3.58.0 */
    const file$2 = "src\\components\\Games\\BP.svelte";

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let canvas_1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			canvas_1 = element("canvas");
    			attr_dev(canvas_1, "width", /*gameWidth*/ ctx[2]);
    			attr_dev(canvas_1, "height", /*gameHeight*/ ctx[1]);
    			attr_dev(canvas_1, "class", "svelte-1tkm37");
    			add_location(canvas_1, file$2, 368, 12, 12449);
    			attr_dev(div0, "class", "game svelte-1tkm37");
    			add_location(div0, file$2, 367, 8, 12417);
    			attr_dev(div1, "class", "game-wrapper svelte-1tkm37");
    			add_location(div1, file$2, 366, 4, 12381);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, canvas_1);
    			/*canvas_1_binding*/ ctx[5](canvas_1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			/*canvas_1_binding*/ ctx[5](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const debug = false;

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BP', slots, []);
    	const dispatch = createEventDispatcher();
    	let canvas;
    	let ctx;
    	let gameHeight = 600;
    	let gameWidth = 400;
    	let manager;
    	let blueCup = false;
    	let siteOpened = false;
    	let targetPlane;
    	let ball;
    	let score = 0;
    	let gameEnd = false;

    	function siteNowOpen() {
    		siteOpened = true;
    	}

    	onMount(() => {
    		manager = new GameObjectManager();

    		// get the canvas context
    		ctx = canvas.getContext('2d');

    		targetPlane = new TargetPlane(0, 0, gameWidth, gameHeight - 200);
    		ball = new Ball();

    		// create six cups in inverted pyramid centered
    		manager.add(new Cup(100, 100));

    		manager.add(new Cup(200, 100));
    		manager.add(new Cup(300, 100));
    		manager.add(new Cup(150, 150));
    		manager.add(new Cup(250, 150));
    		manager.add(new Cup(200, 200));
    		manager.add(targetPlane);
    		manager.add(ball);
    		manager.loop();
    	});

    	class Sprite {
    		constructor(url, width, height) {
    			// create image
    			this.image = new Image();

    			this.image.src = url;
    			this.width = width;
    			this.height = height;
    		}

    		draw(ctx, x, y) {
    			ctx.drawImage(this.image, x, y, this.width, this.height);
    		}
    	}

    	class GameObjectManager {
    		constructor() {
    			this.objects = [];
    		}

    		add(object) {
    			this.objects.push(object);
    		}

    		isGameEnd() {
    			let activeCount = 0;

    			this.getCups().forEach(cup => {
    				if (cup.getHitBox().active) {
    					activeCount++;
    				}
    			});

    			if (activeCount === 0) {
    				return true;
    			}
    		}

    		get(index) {
    			return this.objects[index];
    		}

    		getLength() {
    			return this.objects.length;
    		}

    		getCups() {
    			return this.objects.filter(object => object instanceof Cup);
    		}

    		forEach(callback) {
    			this.objects.forEach(callback);
    		}

    		update() {
    			this.objects.forEach(object => {
    				object.update();
    			});
    		}

    		draw(ctx) {
    			// clear the canvas
    			ctx.clearRect(0, 0, gameWidth, gameHeight);

    			this.objects.forEach(object => {
    				object.draw(ctx);
    			});

    			// draw score in the lower left corner
    			ctx.font = '40px Amatic SC';

    			ctx.fillStyle = '#333';
    			ctx.fillText('Score: ' + score, 10, gameHeight - 10);

    			// draw message "Yay, You Are Awesome!" when game is over centered on screen
    			if (gameEnd) {
    				ctx.font = '50px Amatic SC';
    				ctx.fillStyle = '#333';
    				ctx.fillText('Yay, You Are Awesome!', gameWidth / 2 - 150, gameHeight / 2);
    			}
    		}

    		loop() {
    			this.update();
    			this.draw(ctx);
    			requestAnimationFrame(() => this.loop());
    		}
    	}

    	class TargetPlane {
    		constructor(x, y, width, height) {
    			this.x = x;
    			this.y = y;
    			this.width = width;
    			this.height = height;

    			this.sourcePoint = {
    				x: this.x + this.width / 2,
    				y: y + this.height
    			};
    		}

    		draw(ctx) {
    			return;
    		}

    		update() {
    			
    		} // do nothing

    		// project angle and length to plane position 
    		// returns point on plane
    		// projection based on the sourcePoint
    		// clamp values so its always inside of the plane
    		project(angle, length) {
    			// convert angle to radians
    			angle = angle * Math.PI / 180;

    			// calculate x and y point one is sourcePoint and we have the angle and length and need the end point
    			let x = this.sourcePoint.x + length * Math.cos(angle);

    			let y = this.sourcePoint.y + length * Math.sin(angle);

    			// set projected point
    			this.projectedPoint = { x, y };

    			return this.projectedPoint;
    		}
    	}

    	class Ball {
    		constructor() {
    			this.animCos = 0;
    			this.checkingCollision = false;
    			this.isThrown = false;
    			this.x = 0;
    			this.y = 0;
    			this.width = 30;
    			this.height = 30;
    			this.hitBox = new HitBox(0, 0, 30, 30);

    			// source position is on the bottom center of the canvas
    			this.sourcePosition = { x: gameWidth / 2, y: gameHeight - 50 };

    			this.resetToSourcePos();
    			this.sprite = new Sprite('/images/ball.png', 40, 40);

    			// create hitbox
    			this.hitBox = new HitBox(this.x, this.y, this.width, this.height);
    		}

    		setTargetPosition(x, y) {
    			if (this.isThrown) {
    				return;
    			}

    			this.targetPosition = { x, y };
    			this.isThrown = true;
    		}

    		resetToSourcePos() {
    			this.x = this.sourcePosition.x;
    			this.y = this.sourcePosition.y;
    			this.isThrown = false;
    		}

    		draw(ctx) {
    			// draw ball sprite
    			this.sprite.draw(ctx, this.x - 30, this.y - 30);

    			// ctx.beginPath();
    			// ctx.arc(this.x, this.y, 25, 0, 2 * Math.PI);
    			// ctx.fillStyle = 'red';
    			// ctx.fill();
    			// ctx.stroke();
    			this.hitBox.drawDebug(ctx);
    		} // draw hitbox

    		update() {
    			// when thrown, move in 0.75 seconds to target position and stay for 0.5 seconds on the target position
    			if (this.isThrown) {
    				// calculate distance to target
    				let distance = Math.sqrt(Math.pow(this.targetPosition.x - this.x, 2) + Math.pow(this.targetPosition.y - this.y, 2));

    				// calculate direction to target
    				let direction = {
    					x: (this.targetPosition.x - this.x) / distance,
    					y: (this.targetPosition.y - this.y) / distance
    				};

    				// move ball in direction of target
    				this.x += direction.x * 10;

    				this.y += direction.y * 10;

    				// update hitbox
    				this.hitBox.x = this.x - 25;

    				this.hitBox.y = this.y - 25;

    				// check if ball is close enough to target
    				if (distance < 10) {
    					this.x = this.targetPosition.x;
    					this.y = this.targetPosition.y;

    					// bouncing ball animation
    					this.y -= 1;

    					setTimeout(() => this.y += 1, 100);
    					setTimeout(() => this.y -= 1, 200);
    					setTimeout(() => this.y += 1, 300);
    					setTimeout(() => this.y -= 1, 400);

    					// reset ball to source position
    					if (!this.checkingCollision) {
    						this.checkingCollision = true;

    						setTimeout(
    							() => {
    								let cups = manager.getCups();

    								// check if ball collided with cup hit box
    								for (let i = 0; i < cups.length; i++) {
    									if (cups[i].getHitBox().collides(this.hitBox)) {
    										// if so, reset ball to source position
    										cups[i].getHitBox().setActive(false);

    										cups[i].hit();
    										this.checkingCollision = false;
    										score += 25;

    										if (manager.isGameEnd()) {
    											gameEnd = true;
    											dispatch('win');

    											setTimeout(
    												() => {
    													// alert('Game Over');
    													manager.getCups().forEach(cup => cup.reset());

    													gameEnd = false;
    													blueCup = !blueCup;
    												},
    												2500
    											);
    										}

    										this.resetToSourcePos();
    										return;
    									}
    								}

    								this.checkingCollision = false;
    								score -= 5;
    								this.resetToSourcePos();
    							},
    							500
    						);
    					}
    				}
    			} else {
    				this.animCos += 0.05;

    				if (this.animCos > 1) {
    					this.animCos = -1;
    				}

    				this.y = this.sourcePosition.y + Math.cos(this.animCos) * 60 - 30;
    			}
    		}
    	}

    	class Cup {
    		reset() {
    			this.disapear = false;
    			this.wasHit = false;
    			this.opacity = 1;
    			this.cosCount = 0;
    			this.hitBox.active = true;
    		}

    		hit() {
    			this.wasHit = true;
    			setTimeout(() => this.disapear = true, 750);
    			this.cosCount = 0;
    		}

    		getHitBox() {
    			return this.hitBox;
    		}

    		constructor(x, y) {
    			this.opacity = 1;
    			this.cosCount = 0;
    			this.sprite = new Sprite('/images/cup.png', 80, 105.521472393);
    			this.spriteBlue = new Sprite('/images/cup_blue.png', 80, 105.521472393);
    			this.x = x;
    			this.y = y;
    			this.hitBox = new HitBox(x - 35, y - 45, 70, 40);
    			this.wasHit = false;
    			this.disapear = false;
    		}

    		draw(ctx) {
    			// bounce animation when wasHit
    			if (this.wasHit) {
    				this.y -= Math.cos(this.cosCount * Math.PI);

    				// increase cos count to one and then reverse
    				this.cosCount += 0.1;

    				if (this.cosCount > 1) {
    					this.cosCount = 1;
    					this.wasHit = false;
    				}
    			}

    			// when disapear is true, decrease opacity
    			if (this.disapear) {
    				this.opacity -= 0.05;

    				if (this.opacity < 0) {
    					this.opacity = 0;
    				}
    			}

    			ctx.save();

    			// set sprite opacity
    			ctx.globalAlpha = this.opacity;

    			// render sprite
    			if (blueCup) {
    				this.spriteBlue.draw(ctx, this.x - 40, this.y - 40);
    			} else {
    				this.sprite.draw(ctx, this.x - 40, this.y - 40);
    			}

    			// this.sprite.draw(ctx, this.x - 40, this.y - 40);
    			ctx.restore();

    			// render hitbox
    			this.hitBox.drawDebug(ctx);
    		}

    		update() {
    			
    		} // throw new Error('Method not implemented.');
    	}

    	class HitBox {
    		constructor(x, y, width, height) {
    			this.x = x;
    			this.y = y;
    			this.width = width;
    			this.height = height;
    			this.active = true;
    		}

    		setActive(active) {
    			this.active = active;
    		}

    		collides(hitArea) {
    			if (this.active === false) return false;
    			return this.x < hitArea.x + hitArea.width && this.x + this.width > hitArea.x && this.y < hitArea.y + hitArea.height && this.y + this.height > hitArea.y;
    		}

    		drawDebug(ctx) {
    			return;
    		}
    	}

    	function onSwipe(event) {
    		var pos = targetPlane.project(event.detail.angle, event.detail.length);
    		ball.setTargetPosition(pos.x, pos.y);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BP> was created with unknown prop '${key}'`);
    	});

    	function canvas_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			canvas = $$value;
    			$$invalidate(0, canvas);
    		});
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		dispatch,
    		canvas,
    		ctx,
    		gameHeight,
    		gameWidth,
    		manager,
    		debug,
    		blueCup,
    		siteOpened,
    		targetPlane,
    		ball,
    		score,
    		gameEnd,
    		siteNowOpen,
    		Sprite,
    		GameObjectManager,
    		TargetPlane,
    		Ball,
    		Cup,
    		HitBox,
    		onSwipe
    	});

    	$$self.$inject_state = $$props => {
    		if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
    		if ('ctx' in $$props) ctx = $$props.ctx;
    		if ('gameHeight' in $$props) $$invalidate(1, gameHeight = $$props.gameHeight);
    		if ('gameWidth' in $$props) $$invalidate(2, gameWidth = $$props.gameWidth);
    		if ('manager' in $$props) manager = $$props.manager;
    		if ('blueCup' in $$props) blueCup = $$props.blueCup;
    		if ('siteOpened' in $$props) siteOpened = $$props.siteOpened;
    		if ('targetPlane' in $$props) targetPlane = $$props.targetPlane;
    		if ('ball' in $$props) ball = $$props.ball;
    		if ('score' in $$props) score = $$props.score;
    		if ('gameEnd' in $$props) gameEnd = $$props.gameEnd;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canvas, gameHeight, gameWidth, siteNowOpen, onSwipe, canvas_1_binding];
    }

    class BP extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { siteNowOpen: 3, onSwipe: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BP",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get siteNowOpen() {
    		return this.$$.ctx[3];
    	}

    	set siteNowOpen(value) {
    		throw new Error("<BP>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSwipe() {
    		return this.$$.ctx[4];
    	}

    	set onSwipe(value) {
    		throw new Error("<BP>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Pages\BeerPongPage.svelte generated by Svelte v3.58.0 */
    const file$1 = "src\\components\\Pages\\BeerPongPage.svelte";

    // (36:4) <Page  bind:this={page}>
    function create_default_slot$1(ctx) {
    	let bp;
    	let t;
    	let div;
    	let current;
    	let bp_props = {};
    	bp = new BP({ props: bp_props, $$inline: true });
    	/*bp_binding*/ ctx[6](bp);
    	bp.$on("win", /*onWin*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(bp.$$.fragment);
    			t = space();
    			div = element("div");
    			attr_dev(div, "class", "conf svelte-bz2m8e");
    			add_location(div, file$1, 38, 5, 895);
    		},
    		m: function mount(target, anchor) {
    			mount_component(bp, target, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[7](div);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const bp_changes = {};
    			bp.$set(bp_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bp.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bp.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*bp_binding*/ ctx[6](null);
    			destroy_component(bp, detaching);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[7](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(36:4) <Page  bind:this={page}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let page_1;
    	let current;

    	let page_1_props = {
    		$$slots: { default: [create_default_slot$1] },
    		$$scope: { ctx }
    	};

    	page_1 = new Page({ props: page_1_props, $$inline: true });
    	/*page_1_binding*/ ctx[8](page_1);

    	const block = {
    		c: function create() {
    			create_component(page_1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(page_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const page_1_changes = {};

    			if (dirty & /*$$scope, conf, beerPong*/ 517) {
    				page_1_changes.$$scope = { dirty, ctx };
    			}

    			page_1.$set(page_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(page_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(page_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*page_1_binding*/ ctx[8](null);
    			destroy_component(page_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('BeerPongPage', slots, []);
    	let conf;
    	let page;
    	let beerPong;

    	function getPage() {
    		return page;
    	}

    	function getBeerPong() {
    		return beerPong;
    	}

    	function onWin() {
    		new Confetti({
    				target: conf,
    				props: {
    					amount: 150,
    					duration: 2000,
    					size: 15,
    					x: [-0.8, 0.8],
    					y: [0.25, 2],
    					colorArray: ['#FDDB77', '#A9C874', '#63AC7F', '#308C82', '#266A76', '#2F4858']
    				}
    			});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<BeerPongPage> was created with unknown prop '${key}'`);
    	});

    	function bp_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			beerPong = $$value;
    			$$invalidate(2, beerPong);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			conf = $$value;
    			$$invalidate(0, conf);
    		});
    	}

    	function page_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			page = $$value;
    			$$invalidate(1, page);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Page,
    		Bp: BP,
    		Confetti,
    		conf,
    		page,
    		beerPong,
    		getPage,
    		getBeerPong,
    		onWin
    	});

    	$$self.$inject_state = $$props => {
    		if ('conf' in $$props) $$invalidate(0, conf = $$props.conf);
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    		if ('beerPong' in $$props) $$invalidate(2, beerPong = $$props.beerPong);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		conf,
    		page,
    		beerPong,
    		onWin,
    		getPage,
    		getBeerPong,
    		bp_binding,
    		div_binding,
    		page_1_binding
    	];
    }

    class BeerPongPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { getPage: 4, getBeerPong: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BeerPongPage",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get getPage() {
    		return this.$$.ctx[4];
    	}

    	set getPage(value) {
    		throw new Error("<BeerPongPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getBeerPong() {
    		return this.$$.ctx[5];
    	}

    	set getBeerPong(value) {
    		throw new Error("<BeerPongPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // public svelte store
    const beerPong = writable({ beerPong: null });

    /* src\App.svelte generated by Svelte v3.58.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    // (73:1) <AppContainer>
    function create_default_slot(ctx) {
    	let card_1;
    	let current;
    	let card_1_props = {};
    	card_1 = new Card({ props: card_1_props, $$inline: true });
    	/*card_1_binding*/ ctx[5](card_1);

    	const block = {
    		c: function create() {
    			create_component(card_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card_1_changes = {};
    			card_1.$set(card_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			/*card_1_binding*/ ctx[5](null);
    			destroy_component(card_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(73:1) <AppContainer>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let appcontainer;
    	let t0;
    	let swipehint;
    	let t1;
    	let touchgesture;
    	let t2;
    	let div;
    	let confetti;
    	let current;

    	appcontainer = new AppContainer({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	swipehint = new SwipeHint({ $$inline: true });
    	touchgesture = new TouchGesture({ $$inline: true });
    	touchgesture.$on("swipeDetail", /*onSwipeDetail*/ ctx[4]);
    	touchgesture.$on("tap", /*onTap*/ ctx[3]);
    	touchgesture.$on("swipeLeft", /*onForward*/ ctx[1]);
    	touchgesture.$on("swipeRight", /*onBackwards*/ ctx[2]);

    	confetti = new Confetti({
    			props: {
    				amount: "150",
    				duration: "2000",
    				size: "20",
    				x: [-1, 1],
    				y: [0.25, 3],
    				colorArray: ['#FDDB77', '#A9C874', '#63AC7F', '#308C82', '#266A76', '#2F4858']
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(appcontainer.$$.fragment);
    			t0 = space();
    			create_component(swipehint.$$.fragment);
    			t1 = space();
    			create_component(touchgesture.$$.fragment);
    			t2 = space();
    			div = element("div");
    			create_component(confetti.$$.fragment);
    			attr_dev(div, "class", "conf svelte-1tjkmc6");
    			add_location(div, file, 77, 1, 2818);
    			add_location(main, file, 71, 0, 2618);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(appcontainer, main, null);
    			append_dev(main, t0);
    			mount_component(swipehint, main, null);
    			append_dev(main, t1);
    			mount_component(touchgesture, main, null);
    			append_dev(main, t2);
    			append_dev(main, div);
    			mount_component(confetti, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const appcontainer_changes = {};

    			if (dirty & /*$$scope, card*/ 2049) {
    				appcontainer_changes.$$scope = { dirty, ctx };
    			}

    			appcontainer.$set(appcontainer_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(appcontainer.$$.fragment, local);
    			transition_in(swipehint.$$.fragment, local);
    			transition_in(touchgesture.$$.fragment, local);
    			transition_in(confetti.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(appcontainer.$$.fragment, local);
    			transition_out(swipehint.$$.fragment, local);
    			transition_out(touchgesture.$$.fragment, local);
    			transition_out(confetti.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(appcontainer);
    			destroy_component(swipehint);
    			destroy_component(touchgesture);
    			destroy_component(confetti);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let flappyBird;

    	// let beerPong: BeerPong;
    	let pongGame;

    	// beerPong.subscribe((value) => {
    	// 	pongGame = value.beerPong;
    	// });
    	let cupManager = new CupManager();

    	cupManager.addCup(new Cup('long', 'left', '1'));
    	cupManager.addCup(new Cup('long', 'straight', '2'));
    	cupManager.addCup(new Cup('long', 'right', '3'));
    	cupManager.addCup(new Cup('medium', 'left', '4'));
    	cupManager.addCup(new Cup('medium', 'right', '5'));
    	cupManager.addCup(new Cup('short', 'straight', '6'));
    	let pages = [];
    	let testPage;
    	let card;

    	onMount(() => {
    		// testPage.setContentVisible();
    		// return;
    		card.create(CoverPage);

    		card.create(GreetingsPage);
    		card.create(BeerPongPage);

    		// card.create(ImagesPage);
    		// card.create(FlappyBirdPage);
    		card.create(SecretLastPage);

    		// card.create(BirthdayCakePage);
    		card.ready();

    		pongGame = card.getBeerPong();
    	});

    	function onForward(event) {
    		card.nextPage();
    	}

    	function onBackwards(event) {
    		card.prevPage();
    	}

    	function onTap(event) {
    		flappyBird.tap();
    	}

    	function onSwipeDetail(event) {
    		console.log(event.detail);
    		pongGame.onSwipe(event);
    	} // let foundCup = cupManager.getMatchingCup(event.detail.lengthStr, event.detail.angleStr);
    	// if (!foundCup) {

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function card_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			card = $$value;
    			$$invalidate(0, card);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Cup,
    		CupManager,
    		RangeCheck,
    		SwipeDirection,
    		inRange,
    		TouchGesture,
    		AppContainer,
    		Card,
    		Confetti,
    		BeerPongCalculator,
    		SwipeHint,
    		onMount,
    		BirthdayCakePage,
    		GreetingsPage,
    		CoverPage,
    		SecretLastPage,
    		ImagesPage,
    		FlappyBirdPage,
    		BeerPongPage,
    		beerPong,
    		flappyBird,
    		pongGame,
    		cupManager,
    		pages,
    		testPage,
    		card,
    		onForward,
    		onBackwards,
    		onTap,
    		onSwipeDetail
    	});

    	$$self.$inject_state = $$props => {
    		if ('flappyBird' in $$props) flappyBird = $$props.flappyBird;
    		if ('pongGame' in $$props) pongGame = $$props.pongGame;
    		if ('cupManager' in $$props) cupManager = $$props.cupManager;
    		if ('pages' in $$props) pages = $$props.pages;
    		if ('testPage' in $$props) testPage = $$props.testPage;
    		if ('card' in $$props) $$invalidate(0, card = $$props.card);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [card, onForward, onBackwards, onTap, onSwipeDetail, card_1_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
