abstract class BaseComponent extends HTMLElement {
    static resolve?: ((value: boolean | PromiseLike<boolean>) => void);
    static reject?: ((reason?: any) => void);

    static appReady = new Promise<boolean>((res, rej) => {
        BaseComponent.resolve = res;
        BaseComponent.reject = rej;
    });
}

export default BaseComponent;